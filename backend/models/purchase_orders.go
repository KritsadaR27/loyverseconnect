package models

import "time"

// PurchaseOrder โมเดลสำหรับ PO
type PurchaseOrder struct {
	ID             int       `json:"id"`
	ItemName       string    `json:"item_name"`
	TotalStock     int       `json:"total_stock"`
	SupplierName   string    `json:"supplier_name"`
	Reserve        int       `json:"reserve"`
	Recommendation int       `json:"recommendation"`
	DesiredAmount  int       `json:"desired_amount"`
	OrderDate      time.Time `json:"order_date"`
	Status         string    `json:"status"`
	UpdatedBy      string    `json:"updated_by"`
	SortOrder      int       `json:"sort_order"` // เพิ่มฟิลด์สำหรับลำดับการจัดเรียง
}
