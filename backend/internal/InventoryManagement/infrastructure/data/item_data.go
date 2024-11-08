// backend/internal/InventoryManagement/infrastructure/repositories/item_repository.go
package data

import (
	"backend/internal/InventoryManagement/domain/models"
	"database/sql"
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
func nullStringToString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return "ไม่ทราบ" // ค่าที่ต้องการแสดงแทน NULL
}
func (repo *ItemRepositoryDB) FetchItemStockData() ([]models.ItemStockView, error) {
	query := `
        SELECT 
            item_id, 
            item_name, 
            selling_price, 
            cost, 
            category_name, 
            COALESCE(SUM(in_stock), 0) AS total_in_stock,  
            MAX(updated_at) AS latest_update,              
            CASE 
                WHEN bool_or(use_production) = true THEN 'ผลิตเอง' 
                ELSE COALESCE(MAX(supplier_name), 'ไม่ทราบ') 
            END AS supplier_name,
            MAX(order_cycle) AS order_cycle, 
            MAX(selected_days) AS selected_days, 
            variant_id, 
            status, 
            MAX(days_in_stock) AS days_in_stock,
            bool_or(use_production) AS use_production
        FROM 
            item_stock_view
        WHERE 
            store_name NOT IN ('ลุงรวย รถส่งของ', 'สาขาอื่นๆ')
        GROUP BY 
            item_id, 
            item_name, 
            selling_price, 
            cost, 
            category_name, 
            variant_id, 
            status
        ORDER BY 
            item_name ASC
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
		var supplierName sql.NullString
		var orderCycle sql.NullString
		var selectedDays sql.NullString
		var latestUpdate sql.NullTime

		if err := rows.Scan(
			&itemData.ItemID,
			&itemData.ItemName,
			&itemData.SellingPrice,
			&itemData.Cost,
			&itemData.CategoryName,
			&itemData.InStock,
			&latestUpdate,
			&supplierName,
			&orderCycle,
			&selectedDays,
			&itemData.VariantID,
			&itemData.Status,
			&itemData.DaysInStock,
			&itemData.UseProduction,
		); err != nil {
			log.Println("Error scanning row in FetchItemStockData:", err)
			return nil, err
		}

		itemData.UpdatedAt = latestUpdate
		itemData.SupplierName = nullStringToString(supplierName)
		itemData.OrderCycle = nullStringToString(orderCycle)
		itemData.SelectedDays = nullStringToString(selectedDays)

		// เรียกใช้ GetItemStockByStore เพื่อดึงข้อมูลสต๊อกตามสาขา
		storeStocks, err := repo.GetItemStockByStore(itemData.ItemID)
		if err != nil {
			log.Println("Error fetching store stock data:", err)
			return nil, err
		}

		// เพิ่มข้อมูล storeStocks เข้าไปใน itemData
		itemData.Stores = make(map[string]float64)
		for _, storeStock := range storeStocks {
			itemData.Stores[storeStock.StoreName] = storeStock.InStock
		}

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
