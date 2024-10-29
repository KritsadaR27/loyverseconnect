package loyhandlers

import (
	"backend/database"
	"database/sql"
	"encoding/json"
	"net/http"
)

// GetItemStockDataHandler ดึงข้อมูลสินค้าพร้อมสถานะสต็อกและส่งกลับเป็น JSON
func GetItemStockDataHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		itemStockData, err := database.FetchItemStockData(db)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(itemStockData)
	}
}
