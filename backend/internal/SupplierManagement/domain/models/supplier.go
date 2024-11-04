package models

import "database/sql"

// Supplier represents the main structure for storing supplier information.
type Supplier struct {
	SupplierID   string         `json:"supplier_id"`
	SupplierName string         `json:"supplier_name"`
	OrderCycle   sql.NullString `json:"order_cycle"`
	SelectedDays sql.NullString `json:"selected_days"`
	SortOrder    int            `json:"sort_order"`
}

// SupplierInput represents the structure for receiving supplier input data.
type SupplierInput struct {
	SupplierID   string   `json:"supplier_id"`
	SupplierName string   `json:"supplier_name"`
	OrderCycle   string   `json:"order_cycle"`
	SelectedDays []string `json:"selected_days"`
	SortOrder    int      `json:"sort_order"`
}
