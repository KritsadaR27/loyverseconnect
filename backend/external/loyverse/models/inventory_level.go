package models

import "time"

type LoyInventoryLevel struct {
	VariantID string    `json:"variant_id"`
	StoreID   string    `json:"store_id"`
	InStock   float64   `json:"in_stock"`
	UpdatedAt time.Time `json:"updated_at"` // ฟิลด์สำหรับบันทึกเวลาที่มีการอัปเดต

}

type LoyInventoryLevelsResponse struct {
	InventoryLevels []LoyInventoryLevel `json:"inventory_levels"`
	Cursor          string              `json:"cursor"`
}
