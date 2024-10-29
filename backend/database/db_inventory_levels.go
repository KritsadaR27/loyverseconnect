package database

import (
	"backend/models"
	"database/sql"
	"log"
)

// SaveInventoryLevels บันทึกข้อมูล inventory levels ลงในฐานข้อมูล
func SaveInventoryLevels(db *sql.DB, inventoryLevels []models.LoyInventoryLevel) error {
	for _, level := range inventoryLevels {
		_, err := db.Exec("INSERT INTO loyinventorylevels (variant_id, store_id, in_stock) VALUES ($1, $2, $3) ON CONFLICT (variant_id, store_id) DO UPDATE SET in_stock = $3",
			level.VariantID, level.StoreID, level.InStock)
		if err != nil {
			log.Println("Error saving inventory level:", err)
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
