// backend/external/AirtableConnect/cmd/main.go
package main

import (
	"backend/external/AirtableConnect/application/services"
	"backend/external/AirtableConnect/config"
	"backend/external/AirtableConnect/domain/models"
	"backend/external/AirtableConnect/infrastructure/data"
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

	// Initialize repositories
	airtableClientImpl := external.NewAirtableClient(airtableClient)
	notificationRepo := data.NewNotificationRepository(db)

	// Get LINE API URL
	lineAPIURL := os.Getenv("LINE_CONNECT_URL")
	if lineAPIURL == "" {
		lineAPIURL = "http://line-connect:8085/api/line/messages"
	}

	// Initialize notification service
	notificationService := services.NewNotificationService(
		airtableClientImpl,
		notificationRepo,
		baseID,
		lineAPIURL,
	)

	// Initialize notification scheduler
	notificationScheduler := scheduler.NewNotificationScheduler(db, notificationService)
	notificationScheduler.Start()
	defer notificationScheduler.Stop()

	// Set up HTTP router
	mux := http.NewServeMux()
	router.RegisterRoutes(mux, db, airtableClient, notificationScheduler)
	// Apply middleware
	handler := middleware.CORS(mux)

	// Set port and start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8086" // Default port for Airtable Connect service
	}

	// Set up channel for graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	// Start server in a goroutine
	go func() {
		log.Printf("Starting Airtable Connect server on port %s", port)
		if err := http.ListenAndServe(":"+port, handler); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for shutdown signal
	<-stop
	log.Println("Shutting down server...")

	// Send scheduled notifications
	schedules := []models.ScheduledNotification{
		{
			ID:             1,
			TableID:        "table1",
			ViewName:       "view1",
			Fields:         []string{"Field1", "Field2"},
			GroupIDs:       []string{"group1"},
			HeaderTemplate: "Header: {{.Today}}",
			BubbleTemplate: "Bubble: {{.Index}}",
			FooterTemplate: "Footer: {{.Tomorrow}}",
			Schedule:       "0 8 * * *", // ทุกวันเวลา 08:00
			Active:         true,
			EnableBubbles:  true,
		},
	}

	errors := notificationService.SendScheduledNotifications(schedules)
	if len(errors) > 0 {
		for _, err := range errors {
			log.Printf("Error: %v", err)
		}
	} else {
		log.Println("All scheduled notifications sent successfully!")
	}
}
