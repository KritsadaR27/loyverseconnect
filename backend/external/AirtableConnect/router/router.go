// backend/external/AirtableConnect/router/router.go
package router

import (
	"backend/external/AirtableConnect/application/handlers"
	"backend/external/AirtableConnect/application/services"
	"backend/external/AirtableConnect/config"
	"backend/external/AirtableConnect/infrastructure/data"
	"backend/external/AirtableConnect/infrastructure/external"
	"database/sql"
	"net/http"
	"os"

	"github.com/mehanizm/airtable"
)

// RegisterRoutes sets up all routes for the Airtable Connect service
func RegisterRoutes(mux *http.ServeMux, db *sql.DB, airtableClient *airtable.Client) {
	baseID, err := config.GetAirtableBaseID()
	if err != nil {
		panic(err)
	}

	tableRepo := data.NewTableRepository(db)
	recordRepo := data.NewRecordRepository(db)
	airtableClientImpl := external.NewAirtableClient(airtableClient)
	airtableService := services.NewAirtableService(tableRepo, recordRepo, airtableClientImpl, baseID, db)

	lineAPIURL := os.Getenv("LINE_CONNECT_URL")
	if lineAPIURL == "" {
		lineAPIURL = "http://line-connect:8085/api/line/messages"
	}

	notificationRepo := data.NewNotificationRepository(db)
	notificationService := services.NewNotificationService(airtableClientImpl, baseID, lineAPIURL, notificationRepo)

	syncHandler := handlers.NewSyncHandler(airtableService)
	notificationHandler := handlers.NewNotificationHandler(notificationService)

	mux.HandleFunc("/api/airtable/tables", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			syncHandler.GetTables(w, r)
		case http.MethodPost:
			syncHandler.CreateTable(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/airtable/table", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			syncHandler.GetTable(w, r)
		case http.MethodPut:
			syncHandler.UpdateTable(w, r)
		case http.MethodDelete:
			syncHandler.DeleteTable(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/airtable/records", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		syncHandler.GetRecordsFromView(w, r)
	})

	mux.HandleFunc("/api/airtable/sync", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		tableID := r.URL.Query().Get("id")
		if tableID != "" {
			syncHandler.SyncTable(w, r)
		} else {
			syncHandler.SyncAllTables(w, r)
		}
	})

	mux.HandleFunc("/api/airtable/status", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "operational"}`))
	})

	mux.HandleFunc("/api/airtable/notify/line", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		notificationHandler.SendAirtableToLine(w, r)
	})

	mux.HandleFunc("/api/airtable/notify/bubbles", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		notificationHandler.SendRecordPerBubbleToLine(w, r)
	})

	mux.HandleFunc("/api/airtable/schedules", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			notificationHandler.GetSchedules(w, r)
		case http.MethodPost:
			notificationHandler.CreateSchedule(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
}
