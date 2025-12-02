package main

import (
	"log"

	"github.com/caiohportella/blinky/initializers"
	"github.com/caiohportella/blinky/models"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDatabase()
}

func main() {
	log.Println("Migrating database...")
	err := initializers.DB.AutoMigrate(&models.User{}, &models.Link{})
	if err != nil {
		log.Fatal("Failed to migrate database")
	}

	log.Println("Database migrated successfully!")
}
