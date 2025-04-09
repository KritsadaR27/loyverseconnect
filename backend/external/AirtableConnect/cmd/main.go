// backend/external/AirtableConnect/cmd/main.go
package main

import (
	"backend/external/AirtableConnect/config"
	"backend/external/AirtableConnect/middleware"
	"backend/external/AirtableConnect/router"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	// Connect to database
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// Initialize Airtable client
	airtableClient, err := config.NewAirtableClient()
	if err != nil {
		log.Fatalf("Failed to initialize Airtable client: %v", err)
	}

	// Set up HTTP router
	mux := http.NewServeMux()
	router.RegisterRoutes(mux, db, airtableClient)

	// Apply middleware
	handler := middleware.CORS(mux)

	// Set port and start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8086" // Default port for Airtable Connect service
	}

	log.Printf("Starting Airtable Connect server on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
