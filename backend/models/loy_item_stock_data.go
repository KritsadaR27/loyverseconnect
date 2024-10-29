// models/loy_item_stock_data.go
package models

import "database/sql"

// ItemStockData ใช้สำหรับเก็บข้อมูลผสมของสินค้าและสต็อก
type ItemStockData struct {
	ItemName     string         `json:"item_name"`
	InStock      float64        `json:"in_stock"`
	StoreName    string         `json:"store_name"`
	CategoryName string         `json:"category_name"`
	SupplierName sql.NullString `json:"supplier_name"`
}
