// backend/internal/LineConnect/cmd/main.go
package main

import (
	"backend/internal/LineConnect/config"
	"backend/internal/LineConnect/middleware"
	"backend/internal/LineConnect/router"
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

	// Initialize LINE client
	lineClient, err := config.NewLineClient()
	if err != nil {
		log.Fatalf("Failed to initialize LINE client: %v", err)
	}

	// Set up HTTP router
	mux := http.NewServeMux()
	router.RegisterRoutes(mux, db, lineClient)

	// Apply middleware
	handler := middleware.CORS(mux)

	// Set port and start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8085" // Default port for LINE Connect service
	}

	log.Printf("Starting LINE Connect server on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
