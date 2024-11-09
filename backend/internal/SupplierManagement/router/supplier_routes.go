package router

import (
	"backend/internal/SupplierManagement/application/handlers"
	"backend/internal/SupplierManagement/application/services"
	"backend/internal/SupplierManagement/infrastructure/data"
	"database/sql"
	"net/http"
)

func RegisterSupplierRoutes(mux *http.ServeMux, db *sql.DB) {
	supplierRepo := data.NewSupplierRepository(db)
	supplierService := services.NewSupplierService(supplierRepo)
	supplierHandler := handlers.NewSupplierHandler(supplierService)

	mux.HandleFunc("/api/suppliers", supplierHandler.GetSuppliers)
	mux.HandleFunc("/api/suppliers/settings", supplierHandler.SaveSupplierSettings)
}
