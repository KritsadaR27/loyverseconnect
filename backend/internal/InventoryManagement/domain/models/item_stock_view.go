package models

import "database/sql"

type ItemStockView struct {
	ItemID        string             `json:"item_id"`
	ItemName      string             `json:"item_name"`
	SellingPrice  float64            `json:"selling_price"`
	Cost          float64            `json:"cost"`
	CategoryName  string             `json:"category_name"`
	StoreName     string             `json:"store_name"`
	InStock       float64            `json:"in_stock"`
	UpdatedAt     sql.NullTime       `json:"updated_at"`
	SupplierName  string             `json:"supplier_name"`
	OrderCycle    string             `json:"order_cycle"`
	SelectedDays  string             `json:"selected_days"`
	VariantID     string             `json:"variant_id"`
	IsComposite   bool               `json:"is_composite"`
	UseProduction bool               `json:"use_production"`
	Status        string             `json:"status"`
	DaysInStock   sql.NullTime       `json:"days_in_stock"`
	Stores        map[string]float64 `json:"stores"` // เพิ่มฟิลด์นี้เพื่อเก็บข้อมูลสต๊อกแต่ละสาขา
}
