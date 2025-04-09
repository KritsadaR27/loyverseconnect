// backend/external/AirtableConnect/cmd/main.go
package main

import (
	"backend/external/AirtableConnect/application/services"
	"backend/external/AirtableConnect/config"
	"backend/external/AirtableConnect/infrastructure/external"
	"backend/external/AirtableConnect/infrastructure/scheduler"
	"backend/external/AirtableConnect/middleware"
	"backend/external/AirtableConnect/router"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

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

	// Get Airtable base ID
	baseID, err := config.GetAirtableBaseID()
	if err != nil {
		log.Fatalf("Failed to get Airtable base ID: %v", err)
	}

	// สร้าง Repository
	airtableClientImpl := external.NewAirtableClient(airtableClient)
	// notificationRepo := data.NewNotificationRepository(db)

	// สร้าง LineAPI URL
	lineAPIURL := os.Getenv("LINE_CONNECT_URL")
	if lineAPIURL == "" {
		lineAPIURL = "http://line-connect:8085/api/line/messages"
	}

	// สร้าง Service
	notificationService := services.NewNotificationService(airtableClientImpl, baseID, lineAPIURL)

	// เริ่ม scheduler สำหรับการแจ้งเตือนตามกำหนดเวลา
	notificationScheduler := scheduler.NewNotificationScheduler(db, notificationService)
	notificationScheduler.Start()
	defer notificationScheduler.Stop()

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

	// สร้าง channel สำหรับรับสัญญาณการหยุดทำงาน
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// เริ่มต้น server ในอีก goroutine
	go func() {
		log.Printf("Starting Airtable Connect server on port %s", port)
		if err := http.ListenAndServe(":"+port, handler); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// รอสัญญาณการหยุดทำงาน
	<-stop
	log.Println("Shutting down server...")
}
