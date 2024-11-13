// backend/internal/InventoryManagement/infrastructure/repositories/item_repository.go
package data

import (
	"backend/internal/InventoryManagement/domain/models"
	"database/sql"
	"fmt"
	"log"
)

// ItemRepositoryDB represents the repository for accessing item data in the database.
type ItemRepositoryDB struct {
	db *sql.DB
}

// NewItemRepository creates a new instance of ItemRepositoryDB.
func NewItemRepository(db *sql.DB) *ItemRepositoryDB {
	return &ItemRepositoryDB{db: db}
}

// / helper function to convert sql.NullString to string
func nullStringToString(ns sql.NullString, replaceText string) string {
	if ns.Valid {
		return ns.String
	}
	return replaceText // Use the custom replacement text when NULL
}
func (repo *ItemRepositoryDB) FetchItemStockData() ([]models.ItemStockView, error) {
	query := `
	SELECT 
		item_stock_view.item_id, 
		item_stock_view.item_name, 
		selling_price, 
		cost, 
		category_id,
		category_name, 
		store_id,
		store_name,
		COALESCE(SUM(in_stock), 0) AS total_in_stock,  
		MAX(updated_at) AS latest_update,              
		CASE 
			WHEN bool_or(use_production) = true THEN 'ผลิตเอง' 
			ELSE COALESCE(MAX(supplier_name), '')
		END AS supplier_name,
		MAX(order_cycle) AS order_cycle, 
		MAX(selected_days) AS selected_days,
		MAX(supplier_id) AS supplier_id,            
		variant_id, 
		status, 
		MAX(days_in_stock) AS days_in_stock,
		bool_or(use_production) AS use_production,
		item_stock_view.item_supplier_call  -- ใช้ item_supplier_call จาก item_stock_view
	FROM 
		item_stock_view
	WHERE 
		store_name NOT IN ('ลุงรวย รถส่งของ', 'สาขาอื่นๆ')
	GROUP BY 
		item_stock_view.item_id, 
		item_stock_view.item_name, 
		selling_price, 
		cost, 
		category_id, 
		category_name, 
		store_id, 
		store_name, 
		variant_id, 
		status,
		item_stock_view.item_supplier_call  -- เพิ่มใน GROUP BY
	ORDER BY 
		item_stock_view.item_name ASC
`

	rows, err := repo.db.Query(query)
	if err != nil {
		log.Println("Error executing FetchItemStockData query:", err)
		return nil, err
	}
	defer rows.Close()

	var itemStockDataList []models.ItemStockView
	for rows.Next() {
		var itemData models.ItemStockView
		var latestUpdate sql.NullTime
		var supplierID sql.NullString // เพิ่ม supplierID
		var supplierName sql.NullString
		var orderCycle sql.NullString
		var selectedDays sql.NullString
		var daysInStock sql.NullInt64
		// var itemSupplierCall sql.NullString // for scanning item_supplier_call

		if err := rows.Scan(
			&itemData.ItemID,
			&itemData.ItemName,
			&itemData.SellingPrice,
			&itemData.Cost,
			&itemData.CategoryID,
			&itemData.CategoryName,
			&itemData.StoreID,
			&itemData.StoreName,
			&itemData.InStock,
			&latestUpdate,
			&supplierName,
			&orderCycle,
			&selectedDays,
			&supplierID, // สแกน supplier_id ลงใน struct
			&itemData.VariantID,
			&itemData.Status,
			&daysInStock,
			&itemData.UseProduction,
			&itemData.ItemSupplierCall, // scan item_supplier_call
		); err != nil {
			log.Println("Error scanning row in FetchItemStockData:", err)
			return nil, err
		}

		// Set additional fields with null-safe conversions
		itemData.UpdatedAt = latestUpdate
		itemData.SupplierID = nullStringToString(supplierID, "") // แปลง supplier_id ที่ได้จาก sql.NullString เป็น string
		itemData.SupplierName = nullStringToString(supplierName, "")
		itemData.OrderCycle = nullStringToString(orderCycle, "")
		itemData.SelectedDays = nullStringToString(selectedDays, "")
		itemData.DaysInStock = daysInStock
		// itemData.ItemSupplierCall = nullStringToString(ItemSupplierCall, "") // fallback to item_name if null

		itemStockDataList = append(itemStockDataList, itemData)
	}

	return itemStockDataList, nil
}

// backend/internal/InventoryManagement/infrastructure/repositories/item_repository.go
func (repo *ItemRepositoryDB) GetItemStockByStore(itemID string) ([]models.StoreStock, error) {
	query := `
		SELECT 
			store_name, 
			in_stock 
		FROM 
			item_stock_view
		WHERE 
			item_id = $1 AND store_name NOT IN ('ลุงรวย รถส่งของ', 'สาขาอื่นๆ')
		ORDER BY 
			CASE 
				WHEN store_name = 'โกดังปทุม' THEN 1
				WHEN store_name = 'ลุงรวย สาขาปทุมธานี' THEN 2
				WHEN store_name = 'ลุงรวย สาขาฐานเพชรนนท์' THEN 3
				WHEN store_name = 'ลุงรวย สาขาบางปู' THEN 4
				WHEN store_name = 'ลุงรวย สาขาหนองจอก' THEN 5
				WHEN store_name = 'ลุงรวย สาขาศรีราชา' THEN 6
				WHEN store_name = 'โรงไก่' THEN 7
				ELSE 8 
			END
	`
	rows, err := repo.db.Query(query, itemID)
	if err != nil {
		log.Println("Error executing GetItemStockByStore query:", err)
		return nil, err
	}
	defer rows.Close()

	var storeStockList []models.StoreStock
	for rows.Next() {
		var storeStock models.StoreStock
		if err := rows.Scan(&storeStock.StoreName, &storeStock.InStock); err != nil {
			log.Println("Error scanning row in GetItemStockByStore:", err)
			return nil, err
		}
		storeStockList = append(storeStockList, storeStock)
	}

	return storeStockList, nil
}

// GetStockLevels retrieves stock levels for a given item ID.
func (repo *ItemRepositoryDB) GetStockLevels(itemID string) ([]models.InventoryLevel, error) {
	query := `SELECT variant_id, store_id, in_stock, updated_at FROM loyinventorylevels WHERE variant_id = $1`
	rows, err := repo.db.Query(query, itemID)
	if err != nil {
		log.Println("Error executing GetStockLevels query:", err)
		return nil, err
	}
	defer rows.Close()

	var levels []models.InventoryLevel
	for rows.Next() {
		var level models.InventoryLevel
		if err := rows.Scan(&level.VariantID, &level.StoreID, &level.InStock, &level.UpdatedAt); err != nil {
			log.Println("Error scanning row in GetStockLevels:", err)
			return nil, err
		}
		levels = append(levels, level)
	}

	return levels, nil
}

// GetItemByID retrieves an item by its ID.
func (repo *ItemRepositoryDB) GetItemByID(itemID string) (models.Item, error) {
	var item models.Item
	query := `SELECT item_id, item_name, description, category_id, primary_supplier, image_url, default_price, purchase_cost, created_at, updated_at FROM loyitems WHERE item_id = $1`
	err := repo.db.QueryRow(query, itemID).Scan(
		&item.ItemID, &item.ItemName, &item.Description, &item.CategoryID, &item.PrimarySupplier,
		&item.ImageURL, &item.DefaultPrice, &item.PurchaseCost, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		log.Println("Error executing GetItemByID query:", err)
		return item, err
	}

	return item, nil
}

// UpdateItemStatus updates the status of an item by item ID.
func (repo *ItemRepositoryDB) UpdateItemStatus(itemID, status string) error {
	query := `UPDATE loyitems SET status = $2 WHERE item_id = $1`
	_, err := repo.db.Exec(query, itemID, status)
	if err != nil {
		log.Println("Error executing UpdateItemStatus query:", err)
		return err
	}

	return nil
}

// SaveItemSupplierSetting saves or updates the item supplier settings (including item_supplier_call) in the custom_item_fields table.
// SaveItemSupplierSetting saves or updates the item supplier settings (including item_supplier_call and reserve_quantity) in the custom_item_fields table.
func (repo *ItemRepositoryDB) SaveItemSupplierSetting(supplierSettings []models.CustomItemField) error {
	// เริ่มต้นการทำธุรกรรม
	tx, err := repo.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
        INSERT INTO custom_item_fields (item_id, item_supplier_call, reserve_quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (item_id) 
        DO UPDATE SET item_supplier_call = EXCLUDED.item_supplier_call, reserve_quantity = EXCLUDED.reserve_quantity
    `)
	if err != nil {
		return fmt.Errorf("error preparing statement: %v", err)
	}
	defer stmt.Close()

	for _, supplierSetting := range supplierSettings {
		// ทำการ Execute statement เพื่อบันทึกข้อมูลในฐานข้อมูล
		_, err := stmt.Exec(
			supplierSetting.ItemID,           // item_id
			supplierSetting.ItemSupplierCall, // item_supplier_call
			supplierSetting.ReserveQuantity,  // reserve_quantity
		)
		if err != nil {
			return fmt.Errorf("error executing statement: %v", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}
