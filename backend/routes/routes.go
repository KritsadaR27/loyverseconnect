package routes

import (
	"backend/loyhandlers"
	"database/sql"
	"net/http"
)

// RegisterRoutes ฟังก์ชันสำหรับกำหนดเส้นทาง API
func RegisterRoutes(db *sql.DB) {
	// API endpoints สำหรับการซิงค์ข้อมูล
	http.HandleFunc("/api/sync-master-data", loyhandlers.SyncMasterDataHandler)
	http.HandleFunc("/api/sync-receipts", loyhandlers.SyncReceiptsHandler)
	http.HandleFunc("/api/sync-inventory-levels", loyhandlers.SyncInventoryLevelsHandler)
	http.HandleFunc("/api/get-item-stock-data", loyhandlers.GetItemStockDataHandler(db))

	// Webhook endpoint สำหรับรับข้อมูลจาก Loyverse โดยใช้ closure เพื่อส่ง db
	http.HandleFunc("/webhook/loyverse", func(w http.ResponseWriter, r *http.Request) {
		loyhandlers.LoyverseWebhookHandler(db, w, r)
	})

	// ตั้งค่า settings endpoint
	http.HandleFunc("/api/get-settings", loyhandlers.GetSettingsHandler(db))
	http.HandleFunc("/api/update-settings", loyhandlers.UpdateSettingsHandler(db))
}
