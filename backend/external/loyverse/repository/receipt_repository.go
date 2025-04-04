package repository

import (
	"backend/external/loyverse/models"
	"database/sql"
	"encoding/json"
	"log"
	"time"
)

const batchSize = 250 // Define batch size

// SaveReceipts saves receipts data into the database with timezone-aware timestamps
func SaveReceipts(db *sql.DB, receipts []models.LoyReceipt) error {
	for i := 0; i < len(receipts); i += batchSize {
		batchStart := i + 1
		batchEnd := i + batchSize
		if batchEnd > len(receipts) {
			batchEnd = len(receipts)
		}

		// Start a transaction for the batch
		tx, err := db.Begin()
		if err != nil {
			log.Println("Error starting transaction:", err)
			return err
		}

		for _, receipt := range receipts[i:batchEnd] {
			lineItemsJSON, err := json.Marshal(receipt.LineItems)
			if err != nil {
				log.Println("Error marshalling line items:", err)
				tx.Rollback()
				return err
			}

			paymentsJSON, err := json.Marshal(receipt.Payments)
			if err != nil {
				log.Println("Error marshalling payments:", err)
				tx.Rollback()
				return err
			}

			// Use UTC for consistency, or set to specific timezone if required
			createdAt := receipt.CreatedAt.In(time.UTC)
			receiptDate := receipt.ReceiptDate.In(time.UTC)
			updatedAt := receipt.UpdatedAt.In(time.UTC)
			var cancelledAt sql.NullTime
			if receipt.CancelledAt != nil {
				cancelledAt = sql.NullTime{Time: receipt.CancelledAt.In(time.UTC), Valid: true}
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
                    payments,
                    store_id,
                    pos_device_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
                    payments = $13,
                    store_id = $14,
                    pos_device_id = $15`,
				receipt.ReceiptNumber,
				receipt.Note,
				createdAt,
				receiptDate,
				updatedAt,
				cancelledAt,
				receipt.Source,
				receipt.TotalMoney,
				receipt.TotalTax,
				receipt.CustomerID,
				receipt.TotalDiscount,
				lineItemsJSON,
				paymentsJSON,
				receipt.StoreID,
				receipt.PosDeviceId,
			)
			if err != nil {
				tx.Rollback()
				log.Println("Error saving receipt:", err)
				return err
			}
		}

		// Commit transaction after saving the batch
		if err := tx.Commit(); err != nil {
			log.Println("Error committing transaction:", err)
			return err
		}
		log.Printf("Batch %d-%d receipts saved successfully.", batchStart, batchEnd)
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
