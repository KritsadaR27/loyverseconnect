package models

import "time"

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
}

type PurchaseOrderLineItem struct {
	ID               int       `json:"id"`
	PurchaseOrderID  int       `json:"purchase_order_id"`
	ItemName         string    `json:"item_name"`
	TotalStock       int       `json:"total_stock"`
	Reserve          int       `json:"reserve"`
	Recommendation   int       `json:"recommendation"`
	DesiredAmount    int       `json:"desired_amount"`
	ItemSupplierCall string    `json:"item_supplier_call"`
	Cost             float64   `json:"cost"`
	SellingPrice     float64   `json:"selling_price"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	UpdatedBy        string    `json:"updated_by"`
	SortOrder        int       `json:"sort_order"`
}

type PurchaseOrdersByDate struct {
	OrderDate time.Time       `json:"order_date"`
	Orders    []PurchaseOrder `json:"orders"`
}
