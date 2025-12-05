package controllers

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/caiohportella/blinky/dtos"
	"github.com/caiohportella/blinky/initializers"
	"github.com/caiohportella/blinky/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

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
		Email:    strings.ToLower(req.Email),
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

	// Generate JWT token directly
	tokenString, err := generateJWTToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to create token",
		})
		return
	}

	// Return success response with token
	c.JSON(http.StatusCreated, dtos.SuccessResponse{
		Success: true,
		Data: dtos.LoginResponse{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
			Token: tokenString,
			Role:  user.Role,
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

	// Look up user by email (case-insensitive)
	var user models.User
	result := initializers.DB.Where("LOWER(email) = ?", strings.ToLower(req.Email)).First(&user)

	if result.Error != nil {
		fmt.Printf("Login failed: User not found for email %s\n", req.Email)
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid email or password",
		})
		return
	}

	// Compare password with stored hash
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		fmt.Printf("Login failed: Password mismatch for user %s\n", req.Email)
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid email or password",
		})
		return
	}

	// Generate JWT token
	tokenString, err := generateJWTToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to create token",
		})
		return
	}

	// Return success response with token
	c.JSON(http.StatusOK, dtos.SuccessResponse{
		Success: true,
		Data: dtos.LoginResponse{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
			Token: tokenString,
			Role:  user.Role,
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
