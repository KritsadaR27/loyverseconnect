package services

import (
	"backend/database"
	"backend/models"
	"database/sql"
	"fmt"
)

// ListPurchaseOrdersService เรียกข้อมูล PO ที่จัดกลุ่มตาม "วันที่รับของ"
func ListPurchaseOrdersService(db *sql.DB) (map[string][]models.PurchaseOrder, error) {
	groupedPOs, err := database.ListPurchaseOrders(db)
	if err != nil {
		return nil, fmt.Errorf("error getting purchase orders: %v", err)
	}
	return groupedPOs, nil
}

// CreatePurchaseOrderService สร้าง PO ใหม่
func CreatePurchaseOrderService(db *sql.DB, po models.PurchaseOrder) error {
	return database.CreatePurchaseOrder(db, po)
}

// EditPurchaseOrderService แก้ไข PO ที่มีอยู่
func EditPurchaseOrderService(db *sql.DB, po models.PurchaseOrder) error {
	return database.EditPurchaseOrder(db, po)
}

// UpdateSortOrderService อัปเดตลำดับการจัดเรียงของ PO
func UpdateSortOrderService(db *sql.DB, sortedItems []models.PurchaseOrder) error {
	return database.UpdateOrderSortOrder(db, sortedItems)
}

func SaveOrderService(db *sql.DB, order models.PurchaseOrder) error {
	return database.SaveOrder(db, order)
}
