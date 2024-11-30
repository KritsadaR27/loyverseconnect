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
	UseProduction   bool           `json:"use_production"`   // Flag to indicate if the item is used in production
	IsComposite     bool           `json:"is_composite"`     // Flag to indicate if the item is a composite item
	Variants        []ItemVariant  `json:"variants"`         // Variants of the item
}

type ItemVariant struct {
	ItemVariantID string `json:"item_variant_id"` // Unique identifier for the item variant
	ItemID        string `json:"item_id"`         // Foreign key to Item
	Barcode       string `json:"barcode"`         // Barcode for the item variant
}

// CustomItemField represents the structure for storing item supplier call data in custom_item_fields.
type CustomItemField struct {
	ItemID           string `json:"item_id"`
	ItemSupplierCall string `json:"item_supplier_call"`
	ReserveQuantity  int    `json:"reserve_quantity"` // เพิ่มฟิลด์ ReserveQuantity
}
