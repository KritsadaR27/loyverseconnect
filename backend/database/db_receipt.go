package database

import (
	"backend/models"
	"database/sql"
	"encoding/json"
	"log"
)

const batchSize = 250 // กำหนด batch size
// SaveReceipts บันทึกข้อมูลใบเสร็จในฐานข้อมูลแบบ Batch
func SaveReceipts(db *sql.DB, receipts []models.LoyReceipt) error {
	for i := 0; i < len(receipts); i += batchSize {
		end := i + batchSize
		if end > len(receipts) {
			end = len(receipts)
		}

		// เริ่ม Transaction สำหรับ batch นี้
		tx, err := db.Begin()
		if err != nil {
			log.Println("Error starting transaction:", err)
			return err
		}

		for _, receipt := range receipts[i:end] {
			lineItemsJSON, err := json.Marshal(receipt.LineItems)
			if err != nil {
				log.Println("Error marshalling line items:", err)
				tx.Rollback() // ยกเลิก Transaction หากมีข้อผิดพลาด
				return err
			}

			paymentsJSON, err := json.Marshal(receipt.Payments)
			if err != nil {
				log.Println("Error marshalling payments:", err)
				tx.Rollback() // ยกเลิก Transaction หากมีข้อผิดพลาด

				return err
			}

			_, err = tx.Exec(`
                INSERT INTO loyreceipts (
                    receipt_number,
                    note,
                    created_at,
                    receipt_date,
                    updated_at,
                    cancelled_at,
                    source,
                    total_money,
                    total_tax,
                    customer_id,
                    total_discount,
                    line_items,
                    payments
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                ON CONFLICT (receipt_number) DO UPDATE SET
                    note = $2,
                    created_at = $3,
                    receipt_date = $4,
                    updated_at = $5,
                    cancelled_at = $6,
                    source = $7,
                    total_money = $8,
                    total_tax = $9,
                    customer_id = $10,
                    total_discount = $11,
                    line_items = $12,
                    payments = $13`,
				receipt.ReceiptNumber,
				receipt.Note,
				receipt.CreatedAt,
				receipt.ReceiptDate,
				receipt.UpdatedAt,
				receipt.CancelledAt,
				receipt.Source,
				receipt.TotalMoney,
				receipt.TotalTax,
				receipt.CustomerID,
				receipt.TotalDiscount,
				lineItemsJSON,
				paymentsJSON,
			)
			if err != nil {
				tx.Rollback() // ยกเลิก Transaction หากมีข้อผิดพลาด
				log.Println("Error saving receipt:", err)
				return err
			}
		}

		// Commit Transaction เมื่อบันทึก batch สำเร็จ
		if err := tx.Commit(); err != nil {
			log.Println("Error committing transaction:", err)
			return err
		}
		log.Printf("Batch %d-%d receipts saved successfully.", i+1, end)
	}

	log.Println("All receipts saved successfully.")
	return nil
}

// ClearOldData เคลียร์ข้อมูลเก่าในตารางที่เกี่ยวข้อง
func ClearOldReceiptsData(db *sql.DB) error {
	_, err := db.Exec("TRUNCATE TABLE loyreceipts RESTART IDENTITY")
	if err != nil {
		log.Println("Error clearing old data:", err)
		return err
	}
	log.Println("Old loyreceipts data cleared successfully.")
	return nil
}
