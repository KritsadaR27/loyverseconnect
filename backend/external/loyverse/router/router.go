// backend/external/loyverse/router/router.go
package router

import (
	"backend/external/loyverse/handlers"
	"backend/external/loyverse/middleware" // Import middleware
	"database/sql"
	"net/http"
)

// RegisterRoutes ตั้งค่า routes สำหรับ loyverse API
func RegisterRoutes(mux *http.ServeMux, db *sql.DB) {
	// Wrap routes ด้วย middleware CORS
	mux.Handle("/api/sync-master-data", middleware.CORS(http.HandlerFunc(handlers.SyncMasterDataHandler)))
	mux.Handle("/api/sync-receipts", middleware.CORS(http.HandlerFunc(handlers.SyncReceiptsHandler)))
	mux.Handle("/api/sync-inventory-levels", middleware.CORS(http.HandlerFunc(handlers.SyncInventoryLevelsHandler)))

	// Webhook endpoint
	mux.Handle("/webhook/loyverse", middleware.CORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlers.LoyverseWebhookHandler(db, w, r)
	})))

	mux.Handle("/api/update-settings", middleware.CORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlers.UpdateSettingsHandler(db).ServeHTTP(w, r)
	})))

	mux.Handle("/api/get-settings", middleware.CORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlers.GetSettingsHandler(db).ServeHTTP(w, r)
	})))

	mux.Handle("/api/masterdata", middleware.CORS(http.HandlerFunc(handlers.GetMasterDataHandler)))
}
