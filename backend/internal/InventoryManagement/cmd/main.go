// backend/internal/InventoryManagement/cmd/main.go
package main

import (
	"backend/internal/InventoryManagement/config"
	"backend/internal/InventoryManagement/infrastructure/external"
	"backend/internal/InventoryManagement/middleware"
	"backend/internal/InventoryManagement/router"
	"log"
	"net/http"
	"os"
)

func main() {
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	sheetsClient, err := external.NewGoogleSheetsClient("./credentials.json", "143oyrxaUhx48sDXv144YMwPhqPa02rbSMtfU3fjAHfs", "itemstockdata!A1")
	if err != nil {
		log.Fatalf("Failed to initialize Google Sheets client: %v", err)
	}

	mux := http.NewServeMux()
	router.RegisterRoutes(mux, db, sheetsClient)

	handler := middleware.CORS(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}
	log.Printf("Starting server on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
