// backend/internal/SaleManagement/domain/models/sales_by_day.go
package models

import "time"

type SalesByDay struct {
	SaleDate      time.Time `json:"sale_date"`
	ItemName      string    `json:"item_name"` // เพิ่มฟิลด์นี้
	TotalQuantity float64   `json:"total_quantity"`
	TotalSales    float64   `json:"total_sales"`
	TotalProfit   float64   `json:"total_profit"`
}
