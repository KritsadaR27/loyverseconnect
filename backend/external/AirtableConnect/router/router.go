// backend/external/AirtableConnect/router/router.go
// แก้ไขไฟล์เพื่อเพิ่ม route ใหม่

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

	// สร้าง LineAPI URL
	lineAPIURL := os.Getenv("LINE_CONNECT_URL")
	if lineAPIURL == "" {
		lineAPIURL = "http://line-connect:8085/api/line/messages"
	}

	// สร้าง NotificationService
	notificationService := services.NewNotificationService(airtableClientImpl, baseID, lineAPIURL)

	// Create handlers
	syncHandler := handlers.NewSyncHandler(airtableService)
	notificationHandler := handlers.NewNotificationHandler(notificationService)

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

	// ลงทะเบียน route สำหรับการส่งข้อมูลจาก Airtable ไปยัง LINE
	mux.HandleFunc("/api/airtable/notify/line", notificationHandler.SendAirtableToLine)

	// ลงทะเบียน route สำหรับการจัดการการแจ้งเตือนตามกำหนดเวลา
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
