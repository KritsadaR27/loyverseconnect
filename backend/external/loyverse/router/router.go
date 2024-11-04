// router.go
package router

import (
	"backend/external/loyverse/handlers"
	"database/sql"
	"net/http"
)

// RegisterRoutes ตั้งค่า routes สำหรับ loyverse API
func RegisterRoutes(mux *http.ServeMux, db *sql.DB) {
	// API endpoints สำหรับการซิงค์ข้อมูล
	mux.HandleFunc("/api/sync-master-data", handlers.SyncMasterDataHandler)
	mux.HandleFunc("/api/sync-receipts", handlers.SyncReceiptsHandler)
	mux.HandleFunc("/api/sync-inventory-levels", handlers.SyncInventoryLevelsHandler)

	// Webhook endpoint สำหรับรับข้อมูลจาก Loyverse โดยใช้ closure เพื่อส่ง db
	mux.HandleFunc("/webhook/loyverse", func(w http.ResponseWriter, r *http.Request) {
		handlers.LoyverseWebhookHandler(db, w, r)
	})

	mux.HandleFunc("/api/update-settings", func(w http.ResponseWriter, r *http.Request) {
		handlers.UpdateSettingsHandler(db).ServeHTTP(w, r)
	})

	mux.HandleFunc("/api/get-settings", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetSettingsHandler(db).ServeHTTP(w, r)
	})
}
