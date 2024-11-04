package models

import (
	"database/sql"
	"time"
)

// LoyMasterData struct สำหรับเก็บข้อมูล master data ทั้งหมด
type LoyMasterData struct {
	Categories   []LoyCategory    `json:"categories"`
	Items        []LoyItem        `json:"items"`
	PaymentTypes []LoyPaymentType `json:"payment_types"`
	Stores       []LoyStore       `json:"stores"`
	Suppliers    []LoySupplier    `json:"suppliers"`
}

// LoyCategory struct สำหรับเก็บข้อมูลหมวดหมู่
type LoyCategory struct {
	CategoryID string  `json:"id"`         // category_id
	Name       string  `json:"name"`       // name
	Color      string  `json:"color"`      // color
	CreatedAt  string  `json:"created_at"` // created_at
	DeletedAt  *string `json:"deleted_at"` // deleted_at
}

// LoyItem struct สำหรับเก็บข้อมูลสินค้า
type LoyItem struct {
	ID                string    `json:"id"`                  // item_id
	ItemName          string    `json:"item_name"`           // item_name
	Description       string    `json:"description"`         // description
	CategoryID        *string   `json:"category_id"`         // category_id
	PrimarySupplierID string    `json:"primary_supplier_id"` // supplier_id
	ImageURL          string    `json:"image_url"`           // image_url
	Variants          []Variant `json:"variants"`            // variants
	IsComposite       bool      `json:"is_composite"`        // Indicates if the item is composite
	UseProduction     bool      `json:"use_production"`      // Indicates if production is used for the item
	CreatedAt         time.Time `json:"created_at"`          // Creation timestamp
	UpdatedAt         time.Time `json:"updated_at"`          // Update timestamp

}

// Variant struct สำหรับเก็บข้อมูล variant ของสินค้า
type Variant struct {
	VariantID    string   `json:"variant_id"`    // variant_id
	Cost         float64  `json:"cost"`          // cost
	PurchaseCost float64  `json:"purchase_cost"` // purchase_cost
	DefaultPrice *float64 `json:"default_price"` // selling_price
}

// LoyPaymentType struct สำหรับเก็บข้อมูลประเภทการชำระเงิน
type LoyPaymentType struct {
	PaymentTypeID string `json:"payment_type_id"` // payment_type_id
	Name          string `json:"name"`            // name
	Type          string `json:"type"`            // type
}
type LoyPaymentTypesResponse struct {
	PaymentTypes []LoyPaymentType `json:"payment_types"`
	Cursor       string           `json:"cursor"`
}

type LoyStore struct {
	StoreID   string `json:"id"`
	StoreName string `json:"name"`
}

type LoyStoresResponse struct {
	Stores []LoyStore `json:"stores"`
	Cursor string     `json:"cursor"`
}

type LoySupplier struct {
	SupplierID   string         `json:"id" db:"supplier_id"`              // Loyverse API uses "id", database uses "supplier_id"
	SupplierName string         `json:"name" db:"supplier_name"`          // Compatible with both JSON and database
	OrderCycle   sql.NullString `json:"order_cycle" db:"order_cycle"`     // Order cycle, e.g., "daily", "alternate_days"
	SelectedDays sql.NullString `json:"selected_days" db:"selected_days"` // Comma-separated list of selected days
	SortOrder    int            `json:"sort_order" db:"sort_order"`       // Display or processing order
}
type SupplierInput struct {
	SupplierID   string   `json:"id"`
	SupplierName string   `json:"name"`
	OrderCycle   string   `json:"order_cycle"` // เป็น string ธรรมดา
	SortOrder    int      `json:"sort_order"`
	SelectedDays []string `json:"selected_days"`
}

type LoySuppliersResponse struct {
	Suppliers []LoySupplier `json:"suppliers"`
	Cursor    string        `json:"cursor"`
}
