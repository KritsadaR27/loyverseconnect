// main.go
package main

import (
	"backend/external/loyverse/config"
	"backend/external/loyverse/middleware"
	"backend/external/loyverse/router"
	"log"
	"net/http"
	"os"
)

func main() {
	// โหลด configuration และตั้งค่าการเชื่อมต่อ database
	config.GetLoyverseToken()
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// สร้าง mux ใหม่
	mux := http.NewServeMux()
	router.RegisterRoutes(mux, db)

	handler := middleware.CORS(mux) // เพิ่ม CORS middleware

	// กำหนดพอร์ตสำหรับรัน server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // ใช้พอร์ตเริ่มต้นถ้าไม่มีการตั้งค่า
	}

	log.Printf("Starting server on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
