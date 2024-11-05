// SaleManagement/router/sale_routes.go

package router

import (
	"backend/internal/SaleManagement/application/handlers"
	"backend/internal/SaleManagement/application/services"
	"backend/internal/SaleManagement/infrastructure/data"
	"database/sql"
	"net/http"
)

func RegisterSaleRoutes(mux *http.ServeMux, db *sql.DB) {
	receiptRepo := data.NewReceiptRepository(db)
	receiptService := services.NewReceiptService(receiptRepo)
	receiptHandler := handlers.NewReceiptHandler(receiptService)

	mux.HandleFunc("/api/receipts", receiptHandler.ListReceipts)       // ลิสใบเสร็จ
	mux.HandleFunc("/api/sales/items", receiptHandler.ListSalesByItem) // รายการขายตามสินค้า
	mux.HandleFunc("/api/sales/days", receiptHandler.ListSalesByDay)   // จำนวนขายตามวัน
}
