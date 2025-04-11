// backend/external/LineConnect/cmd/main.go
package main

import (
	"backend/external/LineConnect/config"
	"backend/external/LineConnect/middleware"
	"backend/external/LineConnect/router"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
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
	r := mux.NewRouter()
	router.RegisterRoutes(r, db, lineClient)

	// Apply middleware
	handler := middleware.CORS(r)

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
