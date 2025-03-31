package models

import (
	"time"
)

// PurchaseOrder represents a purchase order entity
type PurchaseOrder struct {
	ID                   int       `json:"id" db:"id"`
	PONumber             string    `json:"po_number" db:"po_number"`
	SupplierID           string    `json:"supplier_id" db:"supplier_id"`
	Status               string    `json:"status" db:"status"`
	OrderDate            time.Time `json:"order_date" db:"order_date"`
	ExpectedDeliveryDate time.Time `json:"expected_delivery_date" db:"expected_delivery_date"`
	TotalAmount          float64   `json:"total_amount" db:"total_amount"`
	Notes                string    `json:"notes" db:"notes"`
	CreatedBy            string    `json:"created_by" db:"created_by"`
	CreatedAt            time.Time `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time `json:"updated_at" db:"updated_at"`
}

// PurchaseOrderItem represents an item in a purchase order
type PurchaseOrderItem struct {
	ID         int64     `json:"id" db:"id"`
	POID       int64     `json:"po_id" db:"po_id"`
	ProductID  string    `json:"product_id" db:"product_id"`
	Quantity   int       `json:"quantity" db:"quantity"`
	UnitPrice  float64   `json:"unit_price" db:"unit_price"`
	TotalPrice float64   `json:"total_price" db:"total_price"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

const (
	StatusDraft      = "draft"
	StatusPending    = "pending"
	StatusApproved   = "approved"
	StatusInProgress = "in_progress"
	StatusCompleted  = "completed"
	StatusCancelled  = "cancelled"
)
