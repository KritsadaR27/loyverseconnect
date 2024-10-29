package loyservices

import (
	"backend/database"
	"backend/models"
	"backend/utils"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
)

const ReceiptsAPIEndpoint = "https://api.loyverse.com/v1.0/receipts"

func SyncReceiptsContinuously(db *sql.DB) error {
	limit := 250
	cursor := ""

	for {
		// ดึงข้อมูลใบเสร็จทีละ batch
		receipts, nextCursor, err := FetchReceiptsBatch(cursor, limit)
		if err != nil {
			return err
		}

		// บันทึกข้อมูลใบเสร็จใน batch นี้
		if err := database.SaveReceipts(db, receipts); err != nil {
			return err
		}
		log.Printf("Saved %d receipts to database", len(receipts))

		// ตรวจสอบว่ามีข้อมูลเพิ่มเติมหรือไม่
		if nextCursor == "" {
			break // ถ้าไม่มี cursor ถัดไป หมายความว่าข้อมูลหมดแล้ว
		}
		cursor = nextCursor // อัปเดต cursor สำหรับ batch ถัดไป
	}

	log.Println("All receipts synced successfully.")
	return nil
}

// FetchReceiptsBatch ดึงข้อมูลใบเสร็จทีละ batch โดยใช้ cursor
func FetchReceiptsBatch(cursor string, limit int) ([]models.LoyReceipt, string, error) {
	token := os.Getenv("LOYVERSE_API_TOKEN")
	endpoint := fmt.Sprintf("%s?limit=%d", ReceiptsAPIEndpoint, limit)
	if cursor != "" {
		endpoint += "&cursor=" + cursor
	}

	body, err := utils.MakeGetRequest(endpoint, token)
	if err != nil {
		log.Println("Error fetching receipts:", err)
		return nil, "", err
	}

	var receiptsResponse struct {
		Receipts []models.LoyReceipt `json:"receipts"`
		Cursor   string              `json:"cursor"`
	}
	if err := json.Unmarshal(body, &receiptsResponse); err != nil {
		log.Println("Error parsing receipts response:", err)
		return nil, "", err
	}

	return receiptsResponse.Receipts, receiptsResponse.Cursor, nil
}

func FetchReceipts() ([]models.LoyReceipt, error) {
	token := os.Getenv("LOYVERSE_API_TOKEN")
	var allReceipts []models.LoyReceipt
	limit := 250
	cursor := ""

	for {
		endpoint := ReceiptsAPIEndpoint + "?limit=" + fmt.Sprint(limit)
		if cursor != "" {
			endpoint += "&cursor=" + cursor
		}

		body, err := utils.MakeGetRequest(endpoint, token)
		if err != nil {
			log.Println("Error fetching receipts:", err)
			return nil, err
		}

		// ตรวจสอบการตอบกลับ HTTP
		var receiptsResponse struct {
			Receipts []models.LoyReceipt `json:"receipts"`
			Cursor   string              `json:"cursor"`
		}
		if err := json.Unmarshal(body, &receiptsResponse); err != nil {
			log.Println("Error parsing receipts response:", err)
			log.Printf("Response body: %s", body) // แสดงเนื้อหาที่ตอบกลับ
			return nil, err
		}

		allReceipts = append(allReceipts, receiptsResponse.Receipts...)

		if receiptsResponse.Cursor == "" {
			break
		}
		cursor = receiptsResponse.Cursor
	}

	log.Printf("Fetched %d receipts from API", len(allReceipts))
	return allReceipts, nil
}

// CancelReceipt ทำการอัปเดตสถานะใบเสร็จให้เป็นยกเลิก
func CancelReceipt(db *sql.DB, receiptNumber string) error {
	_, err := db.Exec(`
        UPDATE loyreceipts
        SET cancelled_at = NOW()  -- อัปเดตให้เป็นเวลาปัจจุบัน
        WHERE receipt_number = $1`,
		receiptNumber,
	)
	if err != nil {
		log.Println("Error canceling receipt:", err)
		return err
	}
	log.Println("Receipt canceled successfully:", receiptNumber)
	return nil
}
