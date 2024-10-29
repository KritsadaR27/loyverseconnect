package loyhandlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
)

// Sale represents the structure of a sale record from `loyreceipts` table
type Sale struct {
	ReceiptNumber string  `json:"receipt_number"`
	SaleDate      string  `json:"receipt_date"`
	TotalAmount   float64 `json:"total_money"`
	StoreID       string  `json:"store_id"`
}

func EnableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

// GetSales handles GET requests to retrieve sales data from loyreceipts
func GetSales(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	EnableCORS(w) // Enable CORS for this endpoint

	rows, err := db.Query("SELECT receipt_number, receipt_date, total_money, store_id FROM loyreceipts")
	if err != nil {
		log.Println("Error querying sales:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var sales []Sale
	for rows.Next() {
		var sale Sale
		if err := rows.Scan(&sale.ReceiptNumber, &sale.SaleDate, &sale.TotalAmount, &sale.StoreID); err != nil {
			log.Println("Error scanning sale:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		sales = append(sales, sale)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sales)
}
