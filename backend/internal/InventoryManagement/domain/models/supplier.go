// backend/internal/InventoryManagement/domain/models/supplier.go
package models

import (
	"database/sql"
)

type Supplier struct {
	SupplierID   string         `json:"supplier_id"`   // Unique identifier for the supplier
	SupplierName string         `json:"supplier_name"` // Supplier's name
	OrderCycle   sql.NullString `json:"order_cycle"`   // e.g., "weekly", "monthly"
	SelectedDays sql.NullString `json:"selected_days"` // Days selected for ordering, if applicable
	SortOrder    int            `json:"sort_order"`    // Order in which supplier appears in UI or reports
}
