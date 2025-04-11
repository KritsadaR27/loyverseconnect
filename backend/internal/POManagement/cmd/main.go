// internal/POManagement/cmd/main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/internal/POManagement/config"
	"backend/internal/POManagement/middleware"
	"backend/internal/POManagement/router"

	_ "github.com/lib/pq"
)

func main() {
	// ตั้งค่า logger
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
	log.Println("Starting PO Management service...")

	// เชื่อมต่อฐานข้อมูล
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// ตรวจสอบการเชื่อมต่อฐานข้อมูล
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("Connected to the database successfully")

	// สร้าง HTTP router
	mux := http.NewServeMux()
	router.RegisterRoutes(mux, db)

	// ใช้ middleware
	handler := middleware.Chain(
		mux,
		middleware.Logging,
		middleware.Recovery,
		middleware.CORS,
	)

	// ตั้งค่า port และเริ่ม server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8088" // Default port for PO Management service
	}

	// สร้าง HTTP server
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// เริ่ม server ในgoroutine
	go func() {
		log.Printf("Starting PO Management server on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// รอสัญญาณปิดเซิร์ฟเวอร์
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// ปิดเซิร์ฟเวอร์อย่างสมบูรณ์
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}

	log.Println("Server stopped gracefully")
}
