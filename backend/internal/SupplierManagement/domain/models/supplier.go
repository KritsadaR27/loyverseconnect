package models

import "database/sql"

// Supplier represents the main structure for storing supplier information.
type Supplier struct {
	SupplierID   string `json:"supplier_id"`
	SupplierName string `json:"supplier_name"`
}

type CustomSupplierField struct {
	SupplierID   string   `json:"supplier_id"`
	OrderCycle   string   `json:"order_cycle"`
	SelectedDays []string `json:"selected_days"`
	SortOrder    int      `json:"sort_order"`
}

type SupplierWithCustomFields struct {
	SupplierID   string         `json:"supplier_id"`
	SupplierName string         `json:"supplier_name"`
	OrderCycle   sql.NullString `json:"order_cycle"`
	SelectedDays []string       `json:"selected_days"`
	SortOrder    sql.NullInt64  `json:"sort_order"`
}
