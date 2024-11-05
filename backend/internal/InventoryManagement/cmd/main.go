// backend/internal/InventoryManagement/cmd/main.go
package main

import (
	"backend/internal/InventoryManagement/config"
	"backend/internal/InventoryManagement/infrastructure/external"
	"backend/internal/InventoryManagement/middleware"
	"backend/internal/InventoryManagement/router"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // อนุญาตให้เชื่อมต่อจากทุก origin (ควรปรับตามความเหมาะสมใน production)
	},
}

// WebSocket handler function
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	for {
		// ส่งข้อมูลอัปเดตไปยัง client ทุก ๆ 5 วินาที (จำลองการอัปเดต)
		message := []byte(`{"item_id": "123", "in_stock": 50}`)
		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Println("Write error:", err)
			break
		}
		time.Sleep(5 * time.Second)
	}
}

func main() {
	// เชื่อมต่อกับฐานข้อมูล
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// เริ่มต้น Google Sheets Client
	sheetsClient, err := external.NewGoogleSheetsClient("./credentials.json", "143oyrxaUhx48sDXv144YMwPhqPa02rbSMtfU3fjAHfs", "itemstockdata!A:E")
	if err != nil {
		log.Fatalf("Failed to initialize Google Sheets client: %v", err)
	}

	// สร้าง router และเพิ่ม WebSocket endpoint
	mux := http.NewServeMux()
	router.RegisterRoutes(mux, db, sheetsClient)
	mux.HandleFunc("/ws/item-stock", handleWebSocket) // เพิ่ม WebSocket endpoint

	// เพิ่ม middleware สำหรับ CORS
	handler := middleware.CORS(mux)

	// ตั้งค่า port และเริ่มต้นเซิร์ฟเวอร์
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}
	log.Printf("Starting server on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
