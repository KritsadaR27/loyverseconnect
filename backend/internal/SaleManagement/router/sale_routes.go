// SaleManagement/router/sale_routes.go

package router

import (
	"backend/internal/SaleManagement/application/handlers"
	"backend/internal/SaleManagement/application/services"
	"backend/internal/SaleManagement/infrastructure/data"
	"backend/internal/SaleManagement/middleware" // Import Middleware
	"database/sql"
	"net/http"
)

func RegisterSaleRoutes(mux *http.ServeMux, db *sql.DB) {
	receiptRepo := data.NewReceiptRepository(db)
	receiptService := services.NewReceiptService(receiptRepo)
	receiptHandler := handlers.NewReceiptHandler(receiptService)

	repo := data.NewSalesRepository(db)
	service := services.NewSalesService(repo)
	handler := handlers.NewSalesHandler(service)

	// ใช้ Middleware CORS กับทุก Route
	mux.Handle("/api/receipts", middleware.CORS(http.HandlerFunc(receiptHandler.ListReceipts)))
	mux.Handle("/api/sales/items", middleware.CORS(http.HandlerFunc(receiptHandler.ListSalesByItem)))
	mux.Handle("/api/sales/days", middleware.CORS(http.HandlerFunc(receiptHandler.ListSalesByDay)))
	mux.Handle("/api/sales/monthly-category", middleware.CORS(http.HandlerFunc(handler.GetMonthlyCategorySales)))
}
