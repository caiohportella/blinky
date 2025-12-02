package initializers

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnvVariables() {
	if err := godotenv.Load(); err != nil { 
		if os.Getenv("DATABASE_URL") == "" {
			log.Println("Warning: No .env file found and DATABASE_URL not set")
		}
	}
}