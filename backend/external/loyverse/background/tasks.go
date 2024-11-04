package background

import (
	"backend/external/loyverse/repository"
	"database/sql"
	"log"
	"strings"
	"time"

	"github.com/robfig/cron/v3"
)

// StartBackgroundTasks ใช้ robfig/cron ในการตั้งเวลา jobs
func StartBackgroundTasks(dbConn *sql.DB) {
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		log.Fatalf("Failed to load timezone: %v", err)
	}

	c := cron.New(cron.WithLocation(loc))

	// Schedule InventoryLoader
	inventoryTime, err := getSyncTime(dbConn, "inventory_sync_time", "03:00")
	if err != nil {
		log.Printf("Error getting inventory sync time: %v, using default 03:00", err)
		inventoryTime = "03:00"
	}
	cronSpec := convertToCronFormat(inventoryTime)
	// log.Printf("Scheduling InventoryLoader with cron format: %s", cronSpec)
	c.AddFunc(cronSpec, func() {
		log.Println("Cron job: Running InventoryLoader...")
		InventoryLoader(dbConn)
	})

	// Schedule ReceiptsLoader
	receiptsTime, err := getSyncTime(dbConn, "receipts_sync_time", "04:30")
	if err != nil {
		log.Printf("Error getting receipts sync time: %v, using default 04:30", err)
		receiptsTime = "04:30"
	}
	cronSpec = convertToCronFormat(receiptsTime)
	// log.Printf("Scheduling ReceiptsLoader with cron format: %s", cronSpec)
	c.AddFunc(cronSpec, func() {
		log.Println("Cron job: Running ReceiptsLoader...")
		ReceiptsLoader(dbConn)
	})

	// Start cron scheduler
	// log.Println("Starting cron scheduler...")
	c.Start()
	defer c.Stop() // เพื่อหยุด cron เมื่อโปรแกรมปิด
}

// getSyncTime และ convertToCronFormat ยังคงอยู่เหมือนเดิม
func getSyncTime(db *sql.DB, key, defaultTime string) (string, error) {
	timeStr, err := repository.GetSetting(db, key)
	if err != nil || timeStr == "" {
		return defaultTime, err
	}
	return timeStr, nil
}

func convertToCronFormat(timeStr string) string {
	parts := strings.Split(timeStr, ":")
	if len(parts) != 2 {
		log.Printf("Invalid time format for cron: %s", timeStr)
		return "0 3 * * *" // Default 03:00 ถ้าเกิดข้อผิดพลาด
	}
	minute := parts[1]
	hour := parts[0]
	cronFormat := minute + " " + hour + " * * *"
	// log.Printf("Setting cron format to: %s", cronFormat) // ตรวจสอบ cron ที่ตั้งไว้
	return cronFormat
}
