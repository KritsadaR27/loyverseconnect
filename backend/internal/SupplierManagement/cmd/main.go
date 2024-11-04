// SupplierManagement/cmd/main.go
package main

import (
	"log"
	"net/http"
	"os"

	"backend/internal/SupplierManagement/config"
	"backend/internal/SupplierManagement/middleware"
	"backend/internal/SupplierManagement/router"

	_ "github.com/lib/pq" // Import PostgreSQL driver
)

func main() {
	// เชื่อมต่อฐานข้อมูล
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// Initialize repositories, services, and handlers
	// supplierRepo := data.NewSupplierRepository(db)
	// supplierService := services.NewSupplierService(supplierRepo)
	// supplierHandler := handlers.NewSupplierHandler(supplierService)

	// สร้าง routing
	mux := http.NewServeMux()
	router.RegisterSupplierRoutes(mux, db) // แก้ supplierHandler เป็น db

	// Middleware (e.g., CORS)
	handlers := middleware.CORS(mux)

	// ตั้งค่าพอร์ตเริ่มต้น
	port := os.Getenv("PORT")
	if port == "" {
		port = "8083" // Default port
	}

	// เริ่ม server
	log.Printf("Starting Supplier Management server on port %s", port)
	if err := http.ListenAndServe(":"+port, handlers); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
