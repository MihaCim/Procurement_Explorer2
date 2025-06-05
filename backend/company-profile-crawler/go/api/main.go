package main

import (
	"os"

	"web-scraper/database"
)

type (
	Config struct {
		Database database.Config `json:"database"`
	}
)

var config *Config

// Load environment variables for database configuration
func LoadDatabaseConfigFromEnv() database.Config {
	return database.Config{
		Host:     os.Getenv("POSTGRES_URL"),
		User:     os.Getenv("POSTGRES_USER"),
		Pass:     os.Getenv("POSTGRES_PASSWORD"),
		Port:     os.Getenv("POSTGRES_PORT"),
		Database: os.Getenv("POSTGRES_DB"),
	}
}

// Load config only from environment variables
func LoadConfig() *Config {
	if config != nil {
		return config
	}

	// Load database config from environment variables
	dbConfig := LoadDatabaseConfigFromEnv()

	// Create the config object with the database config
	config = &Config{
		Database: dbConfig,
	}

	return config
}

func main() {
	// Load the configuration from environment variables
	c := LoadConfig()

	// Establish a database connection
	db := database.GetConnection(c.Database)
	defer db.Close()

	// Start the API
	StartApi()
}
