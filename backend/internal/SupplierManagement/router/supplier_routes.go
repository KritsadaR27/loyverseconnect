package router

import (
	"backend/internal/SupplierManagement/application/handlers"
	"backend/internal/SupplierManagement/application/services"
	"backend/internal/SupplierManagement/infrastructure/data"
	"backend/internal/SupplierManagement/middleware" // Import Middleware CORS
	"database/sql"
	"net/http"
)

func RegisterSupplierRoutes(mux *http.ServeMux, db *sql.DB) {
	supplierRepo := data.NewSupplierRepository(db)
	supplierService := services.NewSupplierService(supplierRepo)
	supplierHandler := handlers.NewSupplierHandler(supplierService)

	// ใช้ Middleware CORS กับทุก Route
	mux.Handle("/api/suppliers", middleware.CORS(http.HandlerFunc(supplierHandler.GetSuppliers)))
	mux.Handle("/api/suppliers/settings", middleware.CORS(http.HandlerFunc(supplierHandler.SaveSupplierSettings)))
}
