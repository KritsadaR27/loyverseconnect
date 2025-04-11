// internal/POManagement/domain/models/po_model.go
package models

import (
	"time"
)

// PurchaseOrder แทนใบสั่งซื้อ
type PurchaseOrder struct {
	ID                 int                 `json:"id" db:"id"`
	PONumber           string              `json:"po_number" db:"po_number"`
	SupplierID         string              `json:"supplier_id" db:"supplier_id"`
	SupplierName       string              `json:"supplier_name" db:"supplier_name"`
	Status             string              `json:"status" db:"status"`
	DeliveryDate       time.Time           `json:"delivery_date" db:"delivery_date"`
	TargetCoverageDate time.Time           `json:"target_coverage_date" db:"target_coverage_date"`
	TotalAmount        float64             `json:"total_amount" db:"total_amount"`
	Items              []PurchaseOrderItem `json:"items"`
	Notes              string              `json:"notes" db:"notes"`
	CreatedBy          string              `json:"created_by" db:"created_by"`
	CreatedAt          time.Time           `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time           `json:"updated_at" db:"updated_at"`
}

// POStatus แสดงสถานะของ PO
const (
	StatusDraft      = "draft"
	StatusPending    = "pending"
	StatusApproved   = "approved"
	StatusInProgress = "in_progress"
	StatusCompleted  = "completed"
	StatusCancelled  = "cancelled"
)
