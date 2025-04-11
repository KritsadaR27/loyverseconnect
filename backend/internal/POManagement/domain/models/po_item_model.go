// internal/POManagement/domain/models/po_item_model.go
package models

import (
	"time"
)

// PurchaseOrderItem แทนรายการสินค้าในใบสั่งซื้อ
type PurchaseOrderItem struct {
	ID                int       `json:"id" db:"id"`
	POID              int       `json:"po_id" db:"po_id"`
	ItemID            string    `json:"item_id" db:"item_id"`
	ItemName          string    `json:"item_name" db:"item_name"`
	SupplierItemName  string    `json:"supplier_item_name" db:"supplier_item_name"`
	Quantity          int       `json:"quantity" db:"quantity"`
	SuggestedQuantity int       `json:"suggested_quantity" db:"suggested_quantity"`
	UnitPrice         float64   `json:"unit_price" db:"unit_price"`
	TotalPrice        float64   `json:"total_price" db:"total_price"`
	Buffer            int       `json:"buffer" db:"buffer"`
	CurrentStock      float64   `json:"current_stock" db:"current_stock"`
	ProjectedStock    float64   `json:"projected_stock" db:"projected_stock"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

// BufferSettings แทนการตั้งค่ายอดเผื่อสินค้า
type BufferSettings struct {
	ItemID          string    `json:"item_id" db:"item_id"`
	ReserveQuantity int       `json:"reserve_quantity" db:"reserve_quantity"`
	CreatedAt       time.Time `json:"created_at,omitempty" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at,omitempty" db:"updated_at"`
}

// ItemStockData แทนข้อมูลสต็อกสินค้า
type ItemStockData struct {
	ItemID       string       `json:"item_id"`
	ItemName     string       `json:"item_name"`
	InStock      float64      `json:"in_stock"`
	CategoryName string       `json:"category_name"`
	SupplierName string       `json:"supplier_name"`
	StockByStore []StoreStock `json:"stock_by_store"`
}

// StoreStock แทนข้อมูลสต็อกตามสาขา
type StoreStock struct {
	StoreID   string  `json:"store_id"`
	StoreName string  `json:"store_name"`
	Quantity  float64 `json:"quantity"`
}

// SalesByDay แทนข้อมูลยอดขายรายวัน
type SalesByDay struct {
	Date     time.Time          `json:"date"`
	ItemID   string             `json:"item_id"`
	Quantity float64            `json:"quantity"`
	ByStore  map[string]float64 `json:"by_store,omitempty"`
}

// POData แทนข้อมูลสำหรับหน้า PO
type POData struct {
	DeliveryDate time.Time   `json:"delivery_date"`
	FutureDates  []time.Time `json:"future_dates"`
	Items        []POItem    `json:"items"`
}

// POItem แทนข้อมูลรายการสินค้าในหน้า PO
type POItem struct {
	ItemID                 string             `json:"item_id"`
	ItemName               string             `json:"item_name"`
	CurrentStock           float64            `json:"current_stock"`
	Buffer                 int                `json:"buffer"`
	ProjectedStock         float64            `json:"projected_stock"`
	PreviousSalesByDay     map[string]float64 `json:"previous_sales_by_day"`
	StockByStore           []StoreStock       `json:"stock_by_store"`
	Supplier               string             `json:"supplier"`
	Category               string             `json:"category"`
	OrderQuantity          int                `json:"order_quantity"`
	SuggestedOrderQuantity int                `json:"suggested_order_quantity"`
}
