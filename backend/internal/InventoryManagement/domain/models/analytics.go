// /backend/internal/InventoryManagement/domain/models/analytics.go
package models

import (
	"time"
)

type Analytics struct {
	ItemID       string    `json:"item_id"`        // Foreign key to Item
	DaysInStock  int       `json:"days_in_stock"`  // Number of days item has been in stock
	AvgSales     float64   `json:"avg_sales"`      // Average sales per day for this item
	AvgRestock   float64   `json:"avg_restock"`    // Average restock quantity per order
	LastSaleDate time.Time `json:"last_sale_date"` // Last sale date for this item
	LastRestock  time.Time `json:"last_restock"`   // Last restock date for this item
}
