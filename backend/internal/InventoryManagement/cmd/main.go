// backend/internal/InventoryManagement/cmd/main.go
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"backend/internal/InventoryManagement/config"
	"backend/internal/InventoryManagement/middleware"
	"backend/internal/InventoryManagement/router"

	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	"github.com/gorilla/websocket"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
	secretmanagerpb "google.golang.org/genproto/googleapis/cloud/secretmanager/v1"
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

// ดึง Secret จาก Google Secret Manager
func getSecret(secretName string) (string, error) {
	ctx := context.Background()

	// ดึง Project ID จาก environment variable
	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		return "", fmt.Errorf("GOOGLE_CLOUD_PROJECT environment variable is not set")
	}

	// สร้าง Secret Manager client
	client, err := secretmanager.NewClient(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to create secret manager client: %v", err)
	}
	defer client.Close()

	// ดึง secret version ล่าสุด
	req := &secretmanagerpb.AccessSecretVersionRequest{
		Name: fmt.Sprintf("projects/%s/secrets/%s/versions/latest", projectID, secretName),
	}
	result, err := client.AccessSecretVersion(ctx, req)
	if err != nil {
		return "", fmt.Errorf("failed to access secret version: %v", err)
	}

	// คืนค่า secret payload
	return string(result.Payload.Data), nil
}

func main() {
	var (
		sheetsService *sheets.Service
		err           error
	)

	ctx := context.Background()

	// กรณีใช้งานใน Production (เช่น GCP + Secret Manager)
	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID != "" {
		log.Println("🌐 Using Google Secret Manager...")
		secretValue, err := getSecret("sheetcredentials")
		if err != nil {
			log.Fatalf("❌ Error accessing secret: %v", err)
		}

		sheetsService, err = sheets.NewService(ctx, option.WithCredentialsJSON([]byte(secretValue)))
		if err != nil {
			log.Fatalf("❌ Failed to initialize Google Sheets client: %v", err)
		}
	} else {
		log.Println("🧪 Using local credentials.json...")
		sheetsService, err = sheets.NewService(ctx, option.WithCredentialsFile("/root/credentials.json")) // ✅ ตรงกับ path ที่ mount
		if err != nil {
			log.Fatalf("❌ Failed to initialize local Sheets client: %v", err)
		}
	}

	// เชื่อมต่อฐานข้อมูล
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatalf("❌ Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// สร้าง router
	mux := http.NewServeMux()
	router.RegisterRoutes(mux, db, sheetsService)
	mux.HandleFunc("/ws/item-stock", handleWebSocket)

	// middleware
	handler := middleware.CORS(mux)

	// server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}
	log.Printf("🚀 Starting server on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
