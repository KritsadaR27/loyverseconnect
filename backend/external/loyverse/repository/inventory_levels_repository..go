package repository

import (
	"backend/external/loyverse/models"
	"database/sql"
	"log"
)

// SaveInventoryLevels saves inventory levels to the database with conflict resolution.
// If an entry with the same variant_id and store_id exists, it updates the in_stock value.
func SaveInventoryLevels(db *sql.DB, inventoryLevels []models.LoyInventoryLevel) error {
	// Begin a transaction for batch insert/update
	tx, err := db.Begin()
	if err != nil {
		log.Println("Failed to begin transaction:", err)
		return err
	}
	defer func() {
		// Rollback the transaction in case of any error during the operation
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	// Prepare the SQL statement once for better performance in batch inserts
	stmt, err := tx.Prepare(`
		INSERT INTO loyinventorylevels (variant_id, store_id, in_stock)
		VALUES ($1, $2, $3)
		ON CONFLICT (variant_id, store_id) DO UPDATE 
		SET in_stock = EXCLUDED.in_stock
	`)
	if err != nil {
		log.Println("Error preparing statement:", err)
		return err
	}
	defer stmt.Close()

	// Loop through each inventory level and execute the prepared statement
	for _, level := range inventoryLevels {
		_, err := stmt.Exec(level.VariantID, level.StoreID, level.InStock)
		if err != nil {
			log.Println("Error saving inventory level for variant:", level.VariantID, "store:", level.StoreID, "error:", err)
			return err
		}
	}

	log.Println("Inventory levels saved successfully.")
	return nil
}

// ClearOldData เคลียร์ข้อมูลเก่าในตารางที่เกี่ยวข้อง
func ClearOldInventoryLevelsData(db *sql.DB) error {
	_, err := db.Exec("TRUNCATE TABLE loyinventorylevels RESTART IDENTITY")
	if err != nil {
		log.Println("Error clearing old data:", err)
		return err
	}
	log.Println("Old loyinventorylevels data cleared successfully.")
	return nil
}
