package router

import (
	"backend/internal/SupplierManagement/application/handlers"
	"backend/internal/SupplierManagement/application/services"
	"backend/internal/SupplierManagement/infrastructure/data"
	"database/sql"
	"net/http"
)

func RegisterSupplierRoutes(mux *http.ServeMux, db *sql.DB) {
	// สร้าง SupplierRepository ด้วย db
	supplierRepo := data.NewSupplierRepository(db)

	// สร้าง SupplierService ด้วย supplierRepo
	supplierService := services.NewSupplierService(supplierRepo)

	// สร้าง SupplierHandler ด้วย supplierService
	supplierHandler := handlers.NewSupplierHandler(supplierService)

	mux.HandleFunc("/api/suppliers", supplierHandler.GetSuppliers)                  // ดึงข้อมูลทั้งหมด
	mux.HandleFunc("/api/suppliers/settings", supplierHandler.SaveSupplierSettings) // บันทึกการตั้งค่า
}
