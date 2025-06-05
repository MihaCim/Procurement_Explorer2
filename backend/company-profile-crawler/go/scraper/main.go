package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"
	"web-scraper/database"

	chr "github.com/chromedp/chromedp"
)

type (
	Config struct {
		// Time to wait before making another request
		Timeout int `json:"timeout"`
		// Time to wait for page to load
		PageLoadTimeout int `json:"page_load_timeout"`
		// Number of pages to visit on a site
		PageLimit int `json:"page_limit"`
		// File extensions in pages to avoid
		AvoidExtensions []string `json:"avoid_extensions"`
		// Number of runners to process sites
		Runners int `json:"runners"`
		// Interval to check for new jobs in seconds
		JobInterval int `json:"job_interval"`
		// Database config
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

// Load config from JSON and then override the database config with environment variables
func LoadConfig() *Config {
	if config != nil {
		return config
	}

	file, err := os.ReadFile("config.json")
	if err != nil {
		panic(err)
	}
	config = &Config{}
	err = json.Unmarshal([]byte(file), config)
	if err != nil {
		panic(err)
	}

	// Load database config from environment and override the JSON config
	dbConfig := LoadDatabaseConfigFromEnv()

	// If any environment variables are empty, keep the ones from the JSON
	if dbConfig.Host != "" {
		config.Database.Host = dbConfig.Host
	}
	if dbConfig.User != "" {
		config.Database.User = dbConfig.User
	}
	if dbConfig.Pass != "" {
		config.Database.Pass = dbConfig.Pass
	}
	if dbConfig.Port != "" {
		config.Database.Port = dbConfig.Port
	}
	if dbConfig.Database != "" {
		config.Database.Database = dbConfig.Database
	}

	return config
}

func main() {
	// Load the configuration
	c := LoadConfig()

	// Establish a connection to the database
	db := database.GetConnection(c.Database)
	defer db.Close()

	jobs := make(chan database.Site, c.Runners)

	// Initialize a controllable Chrome instance
	options := append(chr.DefaultExecAllocatorOptions[:],
		chr.UserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0"),
	)

	ctx, _ := chr.NewExecAllocator(
		context.Background(),
		options...,
	)

	log.Println("INFO: Starting Browser")

	ctx, _ = chr.NewContext(
		ctx,
		chr.WithLogf(log.Printf),
	)

	// Ensure the first tab is created
	if err := chr.Run(ctx); err != nil {
		log.Fatal(err)
	}

	// Wait for the browser to initialize
	time.Sleep(time.Second * 10)

	// Start workers
	for w := 0; w < c.Runners; w++ {
		go worker(ctx, w, jobs)
	}

	// Continuously check for new jobs
	for {
		sites, err := database.GetPendingSites()
		if err != nil {
			log.Print("ERROR: ", err)
		}
		if len(sites) > 0 {
			log.Print("INFO: Adding Jobs")
			for _, s := range sites {
				jobs <- s
			}
		}
		time.Sleep(time.Duration(c.JobInterval) * time.Second)
	}
}
