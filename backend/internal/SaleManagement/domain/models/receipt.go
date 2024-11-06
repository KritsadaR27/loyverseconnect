package models

import (
	"encoding/json"
	"time"
)

type Receipt struct {
	ReceiptNumber    string     `json:"receipt_number"`
	Note             *string    `json:"note"`
	CreatedAt        time.Time  `json:"created_at"`
	ReceiptDate      time.Time  `json:"receipt_date"`
	UpdatedAt        time.Time  `json:"updated_at"`
	CancelledAt      *time.Time `json:"cancelled_at"`
	Source           string     `json:"source"`
	TotalMoney       float64    `json:"total_money"`
	TotalTax         float64    `json:"total_tax"`
	CustomerID       string     `json:"customer_id"`
	TotalDiscount    float64    `json:"total_discount"`
	LineItems        []LineItem `json:"line_items"`
	Payments         []Payment  `json:"payments"`
	StoreID          string     `json:"store_id"`
	PosDeviceId      string     `json:"pos_device_id"`
	StoreName        string     `json:"store_name"`         // เพิ่ม StoreName
	Status           string     `json:"status"`             // เพิ่ม Status
	LineItemsSummary string     `json:"line_items_summary"` // เพิ่มฟิลด์นี้
	PaymentNames     []string   `json:"payment_names"`      // เพิ่มฟิลด์นี้

}

// MarshalJSON customizes the JSON representation of the Receipt struct
func (r Receipt) MarshalJSON() ([]byte, error) {
	type Alias Receipt // Create an alias to avoid recursion in MarshalJSON

	// Load Bangkok location
	loc, _ := time.LoadLocation("Asia/Bangkok")
	receiptDate := r.ReceiptDate.In(loc).Format("2006-01-02 15:04:05") // Adjust format as needed

	// Alias instance for marshaling
	return json.Marshal(&struct {
		ReceiptDate string `json:"receipt_date"`
		Alias
	}{
		ReceiptDate: receiptDate,
		Alias:       (Alias)(r),
	})
}

type LineItem struct {
	ID              string        `json:"id"`
	ItemID          string        `json:"item_id"`
	VariantID       string        `json:"variant_id"`
	ItemName        string        `json:"item_name"`
	VariantName     *string       `json:"variant_name"`
	SKU             string        `json:"sku"`
	Quantity        float64       `json:"quantity"` // เปลี่ยนเป็น float64
	Price           float64       `json:"price"`
	GrossTotalMoney float64       `json:"gross_total_money"`
	TotalMoney      float64       `json:"total_money"`
	Cost            float64       `json:"cost"`
	CostTotal       float64       `json:"cost_total"`
	LineNote        *string       `json:"line_note"`
	LineTaxes       []interface{} `json:"line_taxes"`
	TotalDiscount   float64       `json:"total_discount"`
	LineDiscounts   []interface{} `json:"line_discounts"`
	LineModifiers   []interface{} `json:"line_modifiers"`
}

type Payment struct {
	PaymentTypeID string  `json:"payment_type_id"`
	MoneyAmount   float64 `json:"money_amount"`
	Name          string  `json:"name"`
	Type          string  `json:"type"`
}
