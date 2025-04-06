// backend/external/airtable-connect/main.go
package main

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	router := gin.Default()

	// API routes
	router.GET("/api/airtable/deliveries", getDeliveries)
	router.GET("/api/airtable/orders", getOrders)
	router.POST("/api/notify/line/deliveries", sendDeliveryNotifications)
	router.POST("/api/notify/line/orders", sendOrderNotifications)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	router.Run(":" + port)
}

// ดึงข้อมูลการจัดส่งจาก Airtable
func getDeliveries(c *gin.Context) {
	// ใช้ Airtable API เพื่อดึงข้อมูล
	// ...
}

// ดึงข้อมูลคำสั่งซื้อจาก Airtable
func getOrders(c *gin.Context) {
	// ใช้ Airtable API เพื่อดึงข้อมูล
	// ...
}

// ส่งการแจ้งเตือนไปยัง Line สำหรับการจัดส่ง
func sendDeliveryNotifications(c *gin.Context) {
	// ส่งข้อความไปยังกลุ่มรถรั้ว
	// ...
}

// ส่งการแจ้งเตือนไปยัง Line สำหรับคำสั่งซื้อ
func sendOrderNotifications(c *gin.Context) {
	// ส่งข้อความไปยังกลุ่มซัพพลายเออร์
	// ...
}
