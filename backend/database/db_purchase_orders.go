package database

import (
	"backend/models"
	"database/sql"
	"fmt"
	"log"
)

// ListPurchaseOrders ดึงรายการ PO ทั้งหมดและจัดกลุ่มตาม "วันที่รับของ"
func ListPurchaseOrders(db *sql.DB) (map[string][]models.PurchaseOrder, error) {
	rows, err := db.Query(`
        SELECT id, item_name, total_stock, supplier_name, reserve, recommendation, desired_amount, order_date, status, updated_by 
        FROM purchase_orders ORDER BY order_date
    `)
	if err != nil {
		return nil, fmt.Errorf("error querying purchase orders: %v", err)
	}
	defer rows.Close()

	// Group PO by "วันที่รับของ"
	groupedPOs := make(map[string][]models.PurchaseOrder)
	for rows.Next() {
		var po models.PurchaseOrder
		if err := rows.Scan(&po.ID, &po.ItemName, &po.TotalStock, &po.SupplierName, &po.Reserve, &po.Recommendation, &po.DesiredAmount, &po.OrderDate, &po.Status, &po.UpdatedBy); err != nil {
			return nil, fmt.Errorf("error scanning purchase order row: %v", err)
		}
		dateKey := po.OrderDate.Format("2006-01-02") // ใช้ "วันที่รับของ" เป็น key
		groupedPOs[dateKey] = append(groupedPOs[dateKey], po)
	}

	return groupedPOs, nil
}

// CreatePurchaseOrder ฟังก์ชันสำหรับสร้าง PO ใหม่
func CreatePurchaseOrder(db *sql.DB, po models.PurchaseOrder) error {
	_, err := db.Exec(`
        INSERT INTO purchase_orders (item_name, total_stock, supplier_name, reserve, recommendation, desired_amount, order_date, status, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		po.ItemName, po.TotalStock, po.SupplierName, po.Reserve, po.Recommendation, po.DesiredAmount, po.OrderDate, po.Status, po.UpdatedBy)
	if err != nil {
		return fmt.Errorf("error creating purchase order: %v", err)
	}
	return nil
}

// EditPurchaseOrder ฟังก์ชันสำหรับแก้ไข PO ที่มีอยู่
func EditPurchaseOrder(db *sql.DB, po models.PurchaseOrder) error {
	_, err := db.Exec(`
        UPDATE purchase_orders 
        SET item_name=$1, total_stock=$2, supplier_name=$3, reserve=$4, recommendation=$5, desired_amount=$6, order_date=$7, status=$8, updated_by=$9
        WHERE id=$10`,
		po.ItemName, po.TotalStock, po.SupplierName, po.Reserve, po.Recommendation, po.DesiredAmount, po.OrderDate, po.Status, po.UpdatedBy, po.ID)
	if err != nil {
		return fmt.Errorf("error updating purchase order: %v", err)
	}
	return nil
}

// UpdateOrderSortOrder ฟังก์ชันเพื่ออัปเดต sort_order ของรายการ PO
func UpdateOrderSortOrder(db *sql.DB, sortedItems []models.PurchaseOrder) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}

	stmt, err := tx.Prepare(`UPDATE purchase_orders SET sort_order = $1 WHERE id = $2`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, item := range sortedItems {
		_, err := stmt.Exec(item.SortOrder, item.ID)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

// SaveOrder ฟังก์ชันสำหรับบันทึกเฉพาะข้อมูลที่จำเป็นในตาราง purchase_orders
func SaveOrder(db *sql.DB, order models.PurchaseOrder) error {
	query := `
        INSERT INTO purchase_orders (
           order_date, item_name, supplier_name, sort_order
        ) VALUES ($1, $2, $3, $4)
    `

	_, err := db.Exec(query,
		order.OrderDate, // ใส่ค่า order_date ให้ไม่เป็น NULL
		order.ItemName,
		order.SupplierName,
		order.SortOrder,
	)
	if err != nil {
		log.Printf("Error saving order to database: %v", err)
		return fmt.Errorf("failed to save order: %w", err)
	}

	return nil
}
