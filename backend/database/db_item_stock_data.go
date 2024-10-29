package database

import (
	"backend/models"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
)

func HandleFetchInventoryTotal(w http.ResponseWriter, r *http.Request, dbConn *sql.DB) {

	itemName := r.URL.Query().Get("item_name")
	if itemName == "" {
		http.Error(w, "Item name is required", http.StatusBadRequest)
		return
	}

	query := `
        SELECT COALESCE(SUM(in_stock), 0) AS total_stock
        FROM inventory
        WHERE item_name = $1
          AND store_name NOT IN ('ลุงรวย รถส่งของ', 'สาขาอื่นๆ')
    `

	var totalStock float64
	err := dbConn.QueryRow(query, itemName).Scan(&totalStock)
	if err != nil {
		log.Printf("Error fetching total stock for item %s: %v", itemName, err)
		http.Error(w, "Failed to fetch inventory data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]float64{"total_stock": totalStock})
}

// FetchItemStockData ดึงข้อมูลสินค้าพร้อมสถานะสต็อกจากฐานข้อมูล
func FetchItemStockData(db *sql.DB) ([]models.ItemStockData, error) {
	query := `
	SELECT 
		li.item_name, 
		lil.in_stock, 
		ls.store_name, 
		lc.name AS category_name, 
		lsup.supplier_name
	FROM 
		loyinventorylevels lil
	LEFT JOIN 
		loyitems li ON EXISTS (
			SELECT 1 
			FROM jsonb_array_elements(li.variants) AS variant 
			WHERE variant->>'variant_id' = lil.variant_id
		)
	LEFT JOIN 
		loystores ls ON lil.store_id = ls.store_id
	LEFT JOIN 
		loycategories lc ON li.category_id = lc.category_id
	LEFT JOIN 
		loysupplier lsup ON li.primary_supplier_id = lsup.supplier_id;
	`

	rows, err := db.Query(query)
	if err != nil {
		log.Println("Error executing query:", err)
		return nil, err
	}
	defer rows.Close()

	var itemDataList []models.ItemStockData

	for rows.Next() {
		var itemData models.ItemStockData
		if err := rows.Scan(
			&itemData.ItemName,
			&itemData.InStock,
			&itemData.StoreName,
			&itemData.CategoryName,
			&itemData.SupplierName,
		); err != nil {
			log.Println("Error scanning row:", err)
			return nil, err
		}
		itemDataList = append(itemDataList, itemData)
	}

	return itemDataList, nil
}
