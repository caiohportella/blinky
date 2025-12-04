package main

import (
	"log"
	"net/http"

	"github.com/caiohportella/blinky/controllers"
	"github.com/caiohportella/blinky/initializers"
	"github.com/caiohportella/blinky/middlewares"
	"github.com/caiohportella/blinky/models"
	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDatabase()

	// Auto-migrate on startup
	log.Println("Running database migrations...")
	if err := initializers.DB.AutoMigrate(&models.User{}, &models.Link{}, &models.OTP{}, &models.TwoFactorSession{}); err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}
	log.Println("Database migrations completed!")
}

func main() {
	router := gin.Default()
	router.Use(middlewares.CORSMiddleware())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "API is running"})
	})

	// Public redirect endpoint (no auth required)
	router.GET("/r/:shortCode", controllers.RedirectLink)

	v1 := router.Group("/api/v1")
	{
		users := v1.Group("/users")
		{
			users.POST("", controllers.SignUpWithToken)
			users.POST("/login", controllers.LoginWithToken)
			users.POST("/verify-2fa", controllers.Verify2FA)
			users.GET("/me", middlewares.RequireAuthWithToken, controllers.GetCurrentUser)
		}

		links := v1.Group("/links")
		links.Use(middlewares.RequireAuthWithToken)
		{
			links.GET("", controllers.GetLinks)
			links.POST("", controllers.CreateLink)
			links.DELETE("/:id", controllers.DeleteLink)
			links.GET("/:id/stats", controllers.GetLinkStats)
		}
	}

	router.Run(":8080")
}
