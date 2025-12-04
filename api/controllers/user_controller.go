package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/caiohportella/blinky/dtos"
	"github.com/caiohportella/blinky/initializers"
	"github.com/caiohportella/blinky/models"
	"github.com/caiohportella/blinky/services"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// generateOTPCode generates a random 6-digit OTP code
func generateOTPCode() string {
	b := make([]byte, 3)
	rand.Read(b)
	return fmt.Sprintf("%06d", int(b[0])*10000+int(b[1])*100+int(b[2])%100)[:6]
}

// generateDeviceToken generates a random device token for 2FA caching
func generateDeviceToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// isDeviceTokenValid checks if a device token is valid for the user
func isDeviceTokenValid(userID uint, deviceToken string) bool {
	if deviceToken == "" {
		return false
	}

	var session models.TwoFactorSession
	err := initializers.DB.Where("user_id = ? AND device_token = ?", userID, deviceToken).First(&session).Error
	if err != nil {
		return false
	}

	return session.IsValid()
}

// createDeviceSession creates a new 2FA session for a device (valid for 1 week)
func createDeviceSession(userID uint, deviceToken string) error {
	// Delete existing sessions for this device token
	initializers.DB.Where("device_token = ?", deviceToken).Delete(&models.TwoFactorSession{})

	session := models.TwoFactorSession{
		UserID:      userID,
		DeviceToken: deviceToken,
		ExpiresAt:   time.Now().Add(7 * 24 * time.Hour), // 1 week
	}

	return initializers.DB.Create(&session).Error
}

// sendOTPToUser creates and sends an OTP to the user
func sendOTPToUser(user *models.User) error {
	// Invalidate any existing OTPs for this user
	if err := initializers.DB.Model(&models.OTP{}).Where("user_id = ? AND used = ?", user.ID, false).Update("used", true).Error; err != nil {
		fmt.Printf("[ERROR] Failed to invalidate existing OTPs: %v\n", err)
		// Don't return error here, continue with creating new OTP
	}

	// Generate new OTP
	otpCode := generateOTPCode()
	otp := models.OTP{
		UserID:    user.ID,
		Code:      otpCode,
		ExpiresAt: time.Now().Add(10 * time.Minute),
		Used:      false,
	}

	if err := initializers.DB.Create(&otp).Error; err != nil {
		fmt.Printf("[ERROR] Failed to create OTP: %v\n", err)
		return err
	}

	// Send OTP via email
	emailService := services.NewEmailService()
	if err := emailService.SendOTP(user.Email, user.Name, otpCode); err != nil {
		fmt.Printf("[ERROR] Failed to send OTP email: %v\n", err)
		return err
	}

	return nil
}

// generateJWTToken creates a JWT token for the user
func generateJWTToken(userID uint) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	return token.SignedString([]byte(os.Getenv("SECRET_KEY")))
}

func SignUpWithToken(c *gin.Context) {
	var req dtos.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid input: " + err.Error(),
		})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		c.JSON(http.StatusBadRequest, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to hash the password",
		})
		return
	}

	user := models.User{
		Email:    req.Email,
		Password: string(hash),
		Role:     models.RoleUser,
		Name:     req.Name,
	}

	if err := initializers.DB.Create(&user).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate") ||
			strings.Contains(err.Error(), "unique") {
			c.JSON(http.StatusConflict, dtos.ErrorResponse{
				Success: false,
				Error:   "User with this email already exists",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to create user",
		})
		return
	}

	// Send OTP for 2FA verification (signup requires 2FA)
	if err := sendOTPToUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Account created but failed to send verification email. Please try logging in.",
		})
		return
	}

	// Return 2FA required response
	c.JSON(http.StatusCreated, dtos.SuccessResponse{
		Success: true,
		Data: dtos.Login2FAResponse{
			Requires2FA: true,
			Email:       user.Email,
			Name:        user.Name,
			Message:     "Account created! Verification code sent to your email",
		},
	})
}

func LoginWithToken(c *gin.Context) {
	var req dtos.LoginUserRequest

	// Validate request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid input: " + err.Error(),
		})
		return
	}

	// Look up user by email
	var user models.User
	result := initializers.DB.Where("email = ?", req.Email).First(&user)

	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid email or password",
		})
		return
	}

	// Compare password with stored hash
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid email or password",
		})
		return
	}

	// Check if device token is valid (skip 2FA if valid)
	if isDeviceTokenValid(user.ID, req.DeviceToken) {
		// Device is trusted, generate token directly
		tokenString, err := generateJWTToken(user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
				Success: false,
				Error:   "Failed to create token",
			})
			return
		}

		c.JSON(http.StatusOK, dtos.SuccessResponse{
			Success: true,
			Data: dtos.LoginResponse{
				ID:          user.ID,
				Name:        user.Name,
				Email:       user.Email,
				Token:       tokenString,
				Role:        user.Role,
				DeviceToken: req.DeviceToken, // Return the same device token
			},
		})
		return
	}

	// Device not trusted, require 2FA
	if err := sendOTPToUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to send verification email",
		})
		return
	}

	// Return 2FA required response
	c.JSON(http.StatusOK, dtos.SuccessResponse{
		Success: true,
		Data: dtos.Login2FAResponse{
			Requires2FA: true,
			Email:       user.Email,
			Message:     "Verification code sent to your email",
		},
	})
}

func Verify2FA(c *gin.Context) {
	var req dtos.Verify2FARequest

	// Validate request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid input: " + err.Error(),
		})
		return
	}

	// Look up user by email
	var user models.User
	if err := initializers.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid verification attempt",
		})
		return
	}

	// Find valid OTP
	var otp models.OTP
	err := initializers.DB.Where("user_id = ? AND code = ? AND used = ?", user.ID, req.Code, false).
		Order("created_at DESC").
		First(&otp).Error

	if err != nil {
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid verification code",
		})
		return
	}

	// Check if OTP is expired
	if otp.IsExpired() {
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Verification code has expired",
		})
		return
	}

	// Mark OTP as used
	initializers.DB.Model(&otp).Update("used", true)

	// Generate JWT token
	tokenString, err := generateJWTToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to create token",
		})
		return
	}

	// Create device session for 2FA caching (1 week)
	deviceToken := req.DeviceToken
	if deviceToken == "" {
		deviceToken = generateDeviceToken()
	}

	if err := createDeviceSession(user.ID, deviceToken); err != nil {
		// Log error but don't fail the login
		fmt.Printf("Warning: Failed to create device session: %v\n", err)
	}

	// Return success response with token and device token
	c.JSON(http.StatusOK, dtos.SuccessResponse{
		Success: true,
		Data: dtos.LoginResponse{
			ID:          user.ID,
			Name:        user.Name,
			Email:       user.Email,
			Token:       tokenString,
			Role:        user.Role,
			DeviceToken: deviceToken,
		},
	})
}

func GetCurrentUser(c *gin.Context) {
	// Get user from context (set by RequireAuthWithToken middleware)
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Unauthorized - User not found in context",
		})
		return
	}

	user, ok := userInterface.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to get user data",
		})
		return
	}

	c.JSON(http.StatusOK, dtos.SuccessResponse{
		Success: true,
		Data: dtos.UserResponse{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
		},
	})
}
