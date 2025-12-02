package main

import (
	"net/http"

	"github.com/caiohportella/blinky/controllers"
	"github.com/caiohportella/blinky/initializers"
	"github.com/caiohportella/blinky/middlewares"
	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDatabase()
}

func main() {
	router := gin.Default()
	router.Use(middlewares.CORSMiddleware())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "API is running"})
	})

	v1 := router.Group("/api/v1")
	{
		users := v1.Group("/users")
		{
			users.POST("", controllers.SignUpWithToken)
			users.POST("/login", controllers.LoginWithToken)
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
