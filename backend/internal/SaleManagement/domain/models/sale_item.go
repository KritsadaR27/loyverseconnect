package models

type SaleItem struct {
	ReceiptDate   string  `json:"receipt_date"`
	ItemName      string  `json:"item_name"`
	Quantity      float64 `json:"quantity"`
	TotalSales    float64 `json:"total_sales"`
	TotalCost     float64 `json:"total_cost"` // เพิ่มฟิลด์นี้
	TotalDiscount float64 `json:"total_discount"`
	PaymentName   string  `json:"payment_name"`
	Status        string  `json:"status"`
	CategoryName  string  `json:"category_name"`
	StoreName     string  `json:"store_name"`
	ReceiptNumber string  `json:"receipt_number"`
}
