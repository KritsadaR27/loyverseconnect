// domain/models/po_history.go
package models

import "time"

type POHistory struct {
	ID              int       `json:"id"`
	PurchaseOrderID int       `json:"purchase_order_id"`
	Action          string    `json:"action"`
	ChangedBy       string    `json:"changed_by"`
	ChangedAt       time.Time `json:"changed_at"`
	OldValue        string    `json:"old_value"`
	NewValue        string    `json:"new_value"`
}
