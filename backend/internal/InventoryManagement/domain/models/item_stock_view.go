package models

type ItemStockView struct {
	ItemID        string  `json:"item_id"`
	ItemName      string  `json:"item_name"`
	SellingPrice  float64 `json:"selling_price"`
	Cost          float64 `json:"cost"`
	CategoryName  string  `json:"category_name"`
	StoreName     string  `json:"store_name"`
	InStock       float64 `json:"in_stock"`
	UpdatedAt     string  `json:"updated_at"`
	SupplierName  string  `json:"supplier_name"` // ควรใช้ sql.NullString
	OrderCycle    string  `json:"order_cycle"`
	SelectedDays  string  `json:"selected_days"` // เก็บข้อมูล SQL NullString แต่ไม่ส่งออก
	VariantID     string  `json:"variant_id"`
	IsComposite   bool    `json:"is_composite"`
	UseProduction bool    `json:"use_production"`
	Status        string  `json:"status"`
	DaysInStock   int     `json:"days_in_stock"`
}
