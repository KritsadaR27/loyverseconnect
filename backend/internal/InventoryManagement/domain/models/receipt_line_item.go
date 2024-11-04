// backend/internal/InventoryManagement/domain/models/receipt_line_item.go
package models

type ReceiptLineItem struct {
	ID              string  `json:"id"`                // รหัสรายการ
	SKU             string  `json:"sku"`               // รหัสสินค้า SKU
	Cost            float64 `json:"cost"`              // ต้นทุนต่อหน่วย
	Price           float64 `json:"price"`             // ราคาขายต่อหน่วย
	ItemID          string  `json:"item_id"`           // รหัสสินค้า
	Quantity        int     `json:"quantity"`          // จำนวนที่ขาย
	ItemName        string  `json:"item_name"`         // ชื่อสินค้า
	VariantID       string  `json:"variant_id"`        // รหัสตัวเลือกสินค้า (variant)
	TotalMoney      float64 `json:"total_money"`       // ยอดขายรวมต่อรายการ
	TotalDiscount   float64 `json:"total_discount"`    // ส่วนลดรวม
	GrossTotalMoney float64 `json:"gross_total_money"` // ยอดขายรวมก่อนหักส่วนลด
	CostTotal       float64 `json:"cost_total"`        // ต้นทุนรวม
}
