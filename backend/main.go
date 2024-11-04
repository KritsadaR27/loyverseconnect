package main

import (
	"backend/database"
	"backend/middleware"
	"log"
	"net/http"
)

func main() {

	// เชื่อมต่อกับฐานข้อมูล
	dbConn, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
		return
	}
	defer dbConn.Close()

	// Register routes
	// routes.RegisterRoutes(dbConn)

	// รัน background tasks
	// log.Println("Starting background tasks...")
	// background.StartBackgroundTasks(dbConn)

	// ใช้ CORS Middleware กับทุก request และเริ่มเซิร์ฟเวอร์
	handler := middleware.CORS(http.DefaultServeMux)
	log.Println("Starting server on :8081...")
	log.Fatal(http.ListenAndServe(":8081", handler))
}
