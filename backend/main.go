package main

import (
	"backend/background"
	"backend/database"
	"backend/middleware"
	"backend/routes"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	// โหลด environment variables
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
		return
	}

	// เชื่อมต่อกับฐานข้อมูล
	dbConn, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
		return
	}
	defer dbConn.Close()

	// Register routes
	routes.RegisterRoutes(dbConn)

	// รัน background tasks
	log.Println("Starting background tasks...")
	background.StartBackgroundTasks(dbConn)

	// ใช้ CORS Middleware กับทุก request และเริ่มเซิร์ฟเวอร์
	handler := middleware.CORS(http.DefaultServeMux)
	log.Println("Starting server on :8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
