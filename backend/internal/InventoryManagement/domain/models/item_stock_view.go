package models

import "database/sql"

type ItemStockView struct {
	ItemID            string             `json:"item_id"`
	ItemName          string             `json:"item_name"`
	SellingPrice      float64            `json:"selling_price"`
	Cost              float64            `json:"cost"`
	CategoryID        string             `json:"category_id"` // New field for category_id
	CategoryName      string             `json:"category_name"`
	StoreID           string             `json:"store_id"` // New field for store_id
	StoreName         string             `json:"store_name"`
	InStock           float64            `json:"in_stock"`
	UpdatedAt         sql.NullTime       `json:"updated_at"`
	SupplierID        string             `json:"supplier_id"` // New field for supplier_id
	SupplierName      string             `json:"supplier_name"`
	OrderCycle        string             `json:"order_cycle"`
	SelectedDays      string             `json:"selected_days"`
	VariantID         string             `json:"variant_id"`
	IsComposite       bool               `json:"is_composite"`
	UseProduction     bool               `json:"use_production"`
	Status            string             `json:"status"`
	DaysInStock       sql.NullInt64      `json:"days_in_stock"`       // Updated type to match EXTRACT DAY result
	Stores            map[string]float64 `json:"stores"`              // Map for storing stock per store
	PrimarySupplierID string             `json:"primary_supplier_id"` // New field for primary supplier
	ItemSupplierCall  string             `json:"item_supplier_call"`  // This ensures it appears as item_supplier_call in JSON
}
