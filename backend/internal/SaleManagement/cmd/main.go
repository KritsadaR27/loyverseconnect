// SaleManagement/cmd/main.go
package main

import (
	"log"
	"net/http"
	"os"

	"backend/internal/SaleManagement/application/handlers"
	"backend/internal/SaleManagement/application/services"
	"backend/internal/SaleManagement/config"
	"backend/internal/SaleManagement/infrastructure/data"
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

	// สร้างส่วนประกอบที่จำเป็น
	receiptRepo := data.NewReceiptRepository(db)
	receiptService := services.NewReceiptService(receiptRepo)
	receiptHandler := handlers.NewReceiptHandler(receiptService)

	// สร้าง ServeMux และเพิ่มเส้นทาง
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", receiptHandler.WebSocketEndpoint) // เพิ่มเส้นทาง WebSocket ใน mux
	router.RegisterSaleRoutes(mux, db)                      // เพิ่มเส้นทางอื่น ๆ

	// เพิ่ม Middleware
	handlers := middleware.CORS(mux)

	// ตั้งค่าพอร์ตเริ่มต้น
	port := os.Getenv("PORT")
	if port == "" {
		port = "8084" // Default port for SaleManagement
	}

	// เริ่มเซิร์ฟเวอร์
	log.Printf("Starting Sale Management server on port %s", port)
	if err := http.ListenAndServe(":"+port, handlers); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
