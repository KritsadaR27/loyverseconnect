// backend/internal/AirtableConnect/router/router.go
package router

import (
	"backend/internal/AirtableConnect/application/handlers"
	"backend/internal/AirtableConnect/application/services"
	"backend/internal/AirtableConnect/config"
	"backend/internal/AirtableConnect/infrastructure/data"
	"backend/internal/AirtableConnect/infrastructure/external"
	"database/sql"
	"net/http"

	"github.com/mehanizm/airtable"
)

// RegisterRoutes sets up all routes for the Airtable Connect service
func RegisterRoutes(mux *http.ServeMux, db *sql.DB, airtableClient *airtable.Client) {
	// Get Airtable base ID
	baseID, err := config.GetAirtableBaseID()
	if err != nil {
		panic(err)
	}

	// Create repositories
	tableRepo := data.NewTableRepository(db)
	recordRepo := data.NewRecordRepository(db)

	// Create Airtable client
	airtableClientImpl := external.NewAirtableClient(airtableClient)

	// Create services
	airtableService := services.NewAirtableService(tableRepo, recordRepo, airtableClientImpl, baseID, db)

	// Create handlers
	syncHandler := handlers.NewSyncHandler(airtableService)

	// Register routes for tables
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

	// Register routes for specific table operations
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

	// Register routes for sync operations
	mux.HandleFunc("/api/airtable/sync", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Check if tableID is provided
		tableID := r.URL.Query().Get("id")
		if tableID != "" {
			syncHandler.SyncTable(w, r)
		} else {
			syncHandler.SyncAllTables(w, r)
		}
	})

	// Register route for sync status
	mux.HandleFunc("/api/airtable/status", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		// Status endpoint could be implemented to show sync progress or last sync results
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "operational"}`))
	})
}
