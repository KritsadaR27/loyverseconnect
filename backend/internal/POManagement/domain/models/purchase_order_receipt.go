package models

import "time"

// domain/models/purchase_order_receipt.go
type POReceipt struct {
	ID              int       `json:"id"`
	PurchaseOrderID int       `json:"purchase_order_id"`
	ReceivedDate    time.Time `json:"received_date"`
	ReceivedBy      string    `json:"received_by"`
	Notes           string    `json:"notes"`
	Items           []POReceiptItem
}

type POReceiptItem struct {
	ID          int    `json:"id"`
	ReceiptID   int    `json:"receipt_id"`
	ProductID   string `json:"product_id"`
	Quantity    int    `json:"quantity"`
	QualityNote string `json:"quality_note"`
}
