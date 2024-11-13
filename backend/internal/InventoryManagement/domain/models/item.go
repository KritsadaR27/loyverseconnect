// backend/internal/InventoryManagement/domain/models/item.go
package models

import (
	"database/sql"
	"time"
)

type Item struct {
	ItemID          string         `json:"item_id"`          // Unique identifier for the item
	ItemName        string         `json:"item_name"`        // Name of the item
	Description     sql.NullString `json:"description"`      // Optional description
	CategoryID      sql.NullString `json:"category_id"`      // Foreign key to Category
	PrimarySupplier sql.NullString `json:"primary_supplier"` // Foreign key to Supplier
	ImageURL        sql.NullString `json:"image_url"`        // Image URL for display purposes
	DefaultPrice    float64        `json:"default_price"`    // Selling price for the item
	PurchaseCost    float64        `json:"purchase_cost"`    // Purchase cost of the item
	CreatedAt       time.Time      `json:"created_at"`       // Creation timestamp
	UpdatedAt       time.Time      `json:"updated_at"`       // Update timestamp
}

// CustomItemField represents the structure for storing item supplier call data in custom_item_fields.
type CustomItemField struct {
	ItemID           string `json:"item_id"`
	ItemSupplierCall string `json:"item_supplier_call"`
	ReserveQuantity  int    `json:"reserve_quantity"` // เพิ่มฟิลด์ ReserveQuantity
}
