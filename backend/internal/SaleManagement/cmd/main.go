// SaleManagement/cmd/main.go
package main

import (
	"log"
	"net/http"
	"os"

	"backend/internal/SaleManagement/config"
	"backend/internal/SaleManagement/middleware"
	"backend/internal/SaleManagement/router"

	_ "github.com/lib/pq"
)

func main() {
	// เชื่อมต่อฐานข้อมูล
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// // Initialize repository, service, and handler
	// receiptRepo := data.NewReceiptRepository(db)
	// receiptService := services.NewReceiptService(receiptRepo)
	// receiptHandler := handlers.NewReceiptHandler(receiptService)

	// สร้าง routing
	mux := http.NewServeMux()

	router.RegisterSaleRoutes(mux, db)
	handlers := middleware.CORS(mux)

	// Middleware และตั้งค่าพอร์ตเริ่มต้น
	port := os.Getenv("PORT")
	if port == "" {
		port = "8084" // Default port for SaleManagement
	}

	log.Printf("Starting Sale Management server on port %s", port)
	if err := http.ListenAndServe(":"+port, handlers); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
