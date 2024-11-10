package models

// Supplier represents the main structure for storing supplier information.
type Supplier struct {
	SupplierID   string `json:"supplier_id"`
	SupplierName string `json:"supplier_name"`
}

type CustomSupplierField struct {
	SupplierID   string   `json:"supplier_id"`
	OrderCycle   string   `json:"order_cycle"` // ใช้ sql.NullString เพื่อรองรับ NULL
	SelectedDays []string `json:"selected_days"`
	SortOrder    int      `json:"sort_order"` // ใช้ sql.NullInt64 เพื่อรองรับ NULL
}

type SupplierWithCustomFields struct {
	SupplierID   string   `json:"supplier_id"`
	SupplierName string   `json:"supplier_name"`
	OrderCycle   string   `json:"order_cycle"`
	SelectedDays []string `json:"selected_days"`
	SortOrder    int      `json:"sort_order"`
}
