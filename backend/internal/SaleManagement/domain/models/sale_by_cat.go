// models/sales.go
package models

import "time"

type MonthlyCategorySales struct {
	SaleMonth     time.Time `json:"sale_month"`     // เดือนของการขาย
	CategoryName  string    `json:"category_name"`  // หมวดหมู่สินค้า
	TotalQuantity int       `json:"total_quantity"` // จำนวนสินค้าที่ขายได้
	TotalSales    float64   `json:"total_sales"`    // ยอดขายรวม
	TotalProfit   float64   `json:"total_profit"`   // กำไรสุทธิ
}
