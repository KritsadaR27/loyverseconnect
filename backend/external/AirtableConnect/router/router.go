// backend/external/AirtableConnect/router/router.go
package router

import (
	"backend/external/AirtableConnect/application/handlers"
	"backend/external/AirtableConnect/application/services"
	"backend/external/AirtableConnect/config"
	"backend/external/AirtableConnect/infrastructure/data"
	"backend/external/AirtableConnect/infrastructure/external"
	"database/sql"
	"encoding/json"
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
	viewRepo := data.NewViewRepository(db)

	airtableService := services.NewAirtableService(tableRepo, recordRepo, viewRepo, airtableClientImpl, baseID, db)

	lineAPIURL := os.Getenv("LINE_CONNECT_URL")
	if lineAPIURL == "" {
		lineAPIURL = "http://line-connect:8085/api/line/messages"
	}

	notificationRepo := data.NewNotificationRepository(db)
	notificationService := services.NewNotificationService(airtableClientImpl, notificationRepo, baseID, lineAPIURL)

	syncHandler := handlers.NewSyncHandler(airtableService)
	notificationHandler := handlers.NewNotificationHandler(notificationService, notificationRepo)

	// Table & Sync Endpoints
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

	// Notification Endpoints
	mux.HandleFunc("/api/airtable/notify/line", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			// Handle CORS preflight request
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept, X-Requested-With")
			w.Header().Set("Access-Control-Max-Age", "3600")
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		notificationHandler.SendAirtableToLine(w, r)
	})

	mux.HandleFunc("/api/airtable/notify/bubbles", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			// Handle CORS preflight request
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept, X-Requested-With")
			w.Header().Set("Access-Control-Max-Age", "3600")
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		notificationHandler.SendRecordPerBubbleToLine(w, r)
	})

	// Notification Configuration Endpoints
	mux.HandleFunc("/api/airtable/notifications", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			// Handle CORS preflight request
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept, X-Requested-With")
			w.Header().Set("Access-Control-Max-Age", "3600")
			w.WriteHeader(http.StatusOK)
			return
		}

		switch r.Method {
		case http.MethodGet:
			notificationHandler.GetAllNotifications(w, r)
		case http.MethodPost:
			notificationHandler.CreateNotification(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// มีแนวทางการรับค่า id จาก URL query parameter แทนการใช้แบบ RESTful
	mux.HandleFunc("/api/airtable/notifications/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			// Handle CORS preflight request
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept, X-Requested-With")
			w.Header().Set("Access-Control-Max-Age", "3600")
			w.WriteHeader(http.StatusOK)
			return
		}

		switch r.Method {
		case http.MethodGet:
			notificationHandler.GetNotification(w, r)
		case http.MethodPut:
			notificationHandler.UpdateNotification(w, r)
		case http.MethodDelete:
			notificationHandler.DeleteNotification(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/api/airtable/notifications/run", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			// Handle CORS preflight request
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept, X-Requested-With")
			w.Header().Set("Access-Control-Max-Age", "3600")
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		notificationHandler.RunNotificationNow(w, r)
	})

	mux.HandleFunc("/api/airtable/views", func(w http.ResponseWriter, r *http.Request) {
		tableID := r.URL.Query().Get("table_id")
		if tableID == "" {
			http.Error(w, "Missing table_id", http.StatusBadRequest)
			return
		}

		views, err := airtableService.GetViewsByTableID(tableID)
		if err != nil {
			http.Error(w, "Error fetching views: "+err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{"views": views})
	})
}
