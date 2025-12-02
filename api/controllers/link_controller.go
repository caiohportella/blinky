package controllers

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"net/http"
	"net/url"
	"strconv"

	"github.com/caiohportella/blinky/dtos"
	"github.com/caiohportella/blinky/initializers"
	"github.com/caiohportella/blinky/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// generateShortCode creates a random 7-character short code
func generateShortCode() (string, error) {
	bytes := make([]byte, 6)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes)[:7], nil
}

// getFaviconURL returns the Google favicon service URL for a domain
func getFaviconURL(originalURL string) string {
	parsed, err := url.Parse(originalURL)
	if err != nil {
		return ""
	}
	return "https://www.google.com/s2/favicons?domain=" + parsed.Host + "&sz=128"
}

func GetLinks(c *gin.Context) {
	// Get user from context
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Unauthorized",
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

	// Fetch links for the user
	var links []models.Link
	if err := initializers.DB.Where("user_id = ?", user.ID).Order("created_at DESC").Find(&links).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to fetch links",
		})
		return
	}

	// Convert to response DTOs
	var linkResponses []dtos.LinkResponse
	for _, link := range links {
		linkResponses = append(linkResponses, dtos.LinkResponse{
			ID:          link.ID,
			ShortCode:   link.ShortCode,
			OriginalURL: link.OriginalURL,
			Clicks:      link.Clicks,
			Favicon:     link.Favicon,
			UserID:      link.UserID,
			CreatedAt:   link.CreatedAt,
		})
	}

	// Return empty array instead of null if no links
	if linkResponses == nil {
		linkResponses = []dtos.LinkResponse{}
	}

	c.JSON(http.StatusOK, dtos.SuccessResponse{
		Success: true,
		Data:    linkResponses,
	})
}

func CreateLink(c *gin.Context) {
	// Get user from context
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Unauthorized",
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

	// Parse request body
	var req dtos.CreateLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid input: " + err.Error(),
		})
		return
	}

	// Generate or use custom short code
	shortCode := req.CustomCode
	if shortCode == "" {
		var err error
		shortCode, err = generateShortCode()
		if err != nil {
			c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
				Success: false,
				Error:   "Failed to generate short code",
			})
			return
		}
	}

	// Check if short code already exists
	var existingLink models.Link
	err := initializers.DB.Where("short_code = ?", shortCode).First(&existingLink).Error
	if err == nil {
		// Short code already exists
		c.JSON(http.StatusConflict, dtos.ErrorResponse{
			Success: false,
			Error:   "Short code already exists",
		})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		// Unexpected database error
		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to check short code availability",
		})
		return
	}
	// err is gorm.ErrRecordNotFound - short code is available, continue

	// Create the link
	link := models.Link{
		ShortCode:   shortCode,
		OriginalURL: req.OriginalURL,
		Favicon:     getFaviconURL(req.OriginalURL),
		UserID:      user.ID,
		Clicks:      0,
	}

	if err := initializers.DB.Create(&link).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to create link",
		})
		return
	}

	c.JSON(http.StatusCreated, dtos.SuccessResponse{
		Success: true,
		Data: dtos.LinkResponse{
			ID:          link.ID,
			ShortCode:   link.ShortCode,
			OriginalURL: link.OriginalURL,
			Clicks:      link.Clicks,
			Favicon:     link.Favicon,
			UserID:      link.UserID,
			CreatedAt:   link.CreatedAt,
		},
	})
}

func DeleteLink(c *gin.Context) {
	// Get user from context
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Unauthorized",
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

	// Get link ID from URL param
	linkID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid link ID",
		})
		return
	}

	// Find the link
	var link models.Link
	if err := initializers.DB.First(&link, linkID).Error; err != nil {
		c.JSON(http.StatusNotFound, dtos.ErrorResponse{
			Success: false,
			Error:   "Link not found",
		})
		return
	}

	// Check ownership
	if link.UserID != user.ID {
		c.JSON(http.StatusForbidden, dtos.ErrorResponse{
			Success: false,
			Error:   "You don't have permission to delete this link",
		})
		return
	}

	// Delete the link
	if err := initializers.DB.Delete(&link).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dtos.ErrorResponse{
			Success: false,
			Error:   "Failed to delete link",
		})
		return
	}

	c.JSON(http.StatusOK, dtos.SuccessResponse{
		Success: true,
		Message: "Link deleted successfully",
	})
}

func GetLinkStats(c *gin.Context) {
	// Get user from context
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, dtos.ErrorResponse{
			Success: false,
			Error:   "Unauthorized",
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

	// Get link ID from URL param
	linkID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dtos.ErrorResponse{
			Success: false,
			Error:   "Invalid link ID",
		})
		return
	}

	// Find the link
	var link models.Link
	if err := initializers.DB.First(&link, linkID).Error; err != nil {
		c.JSON(http.StatusNotFound, dtos.ErrorResponse{
			Success: false,
			Error:   "Link not found",
		})
		return
	}

	// Check ownership
	if link.UserID != user.ID {
		c.JSON(http.StatusForbidden, dtos.ErrorResponse{
			Success: false,
			Error:   "You don't have permission to view this link's stats",
		})
		return
	}

	c.JSON(http.StatusOK, dtos.SuccessResponse{
		Success: true,
		Data: dtos.LinkStatsResponse{
			Clicks:      link.Clicks,
			LastClicked: nil, // Could be enhanced with actual click tracking table
		},
	})
}

