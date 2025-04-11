// internal/POManagement/infrastructure/data/po_repository.go
package data

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"backend/internal/POManagement/domain/models"
)

// PurchaseOrderRepository จัดการกับข้อมูล PO ในฐานข้อมูล
type PurchaseOrderRepository struct {
	db *sql.DB
}

// NewPurchaseOrderRepository สร้าง PurchaseOrderRepository ใหม่
func NewPurchaseOrderRepository(db *sql.DB) *PurchaseOrderRepository {
	return &PurchaseOrderRepository{
		db: db,
	}
}

// CreatePO สร้างใบสั่งซื้อใหม่
func (r *PurchaseOrderRepository) CreatePO(ctx context.Context, po *models.PurchaseOrder) error {
	// เริ่มทำธุรกรรม
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// สร้างใบสั่งซื้อ
	query := `
        INSERT INTO purchase_orders (
            po_number, supplier_id, supplier_name, status,
            delivery_date, target_coverage_date, total_amount,
            notes, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
    `

	now := time.Now()
	err = tx.QueryRowContext(
		ctx,
		query,
		po.PONumber,
		po.SupplierID,
		po.SupplierName,
		po.Status,
		po.DeliveryDate,
		po.TargetCoverageDate,
		po.TotalAmount,
		po.Notes,
		po.CreatedBy,
		now,
		now,
	).Scan(&po.ID)

	if err != nil {
		return fmt.Errorf("failed to create purchase order: %w", err)
	}

	// เพิ่มรายการสินค้า
	for i := range po.Items {
		item := &po.Items[i]
		item.POID = po.ID

		itemQuery := `
            INSERT INTO purchase_order_items (
                po_id, item_id, item_name, supplier_item_name,
                quantity, suggested_quantity, unit_price, total_price,
                buffer, current_stock, projected_stock, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id
        `

		err = tx.QueryRowContext(
			ctx,
			itemQuery,
			item.POID,
			item.ItemID,
			item.ItemName,
			item.SupplierItemName,
			item.Quantity,
			item.SuggestedQuantity,
			item.UnitPrice,
			item.TotalPrice,
			item.Buffer,
			item.CurrentStock,
			item.ProjectedStock,
			now,
			now,
		).Scan(&item.ID)

		if err != nil {
			return fmt.Errorf("failed to create purchase order item: %w", err)
		}
	}

	// ยืนยันธุรกรรม
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetPOByID ดึงใบสั่งซื้อตาม ID
func (r *PurchaseOrderRepository) GetPOByID(ctx context.Context, id int) (*models.PurchaseOrder, error) {
	// ดึงข้อมูลใบสั่งซื้อ
	query := `
        SELECT 
            id, po_number, supplier_id, supplier_name, status,
            delivery_date, target_coverage_date, total_amount,
            notes, created_by, created_at, updated_at
        FROM purchase_orders
        WHERE id = $1
    `

	po := &models.PurchaseOrder{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&po.ID,
		&po.PONumber,
		&po.SupplierID,
		&po.SupplierName,
		&po.Status,
		&po.DeliveryDate,
		&po.TargetCoverageDate,
		&po.TotalAmount,
		&po.Notes,
		&po.CreatedBy,
		&po.CreatedAt,
		&po.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no purchase order found with ID %d", id)
		}
		return nil, fmt.Errorf("failed to get purchase order: %w", err)
	}

	// ดึงรายการสินค้า
	itemsQuery := `
        SELECT 
            id, po_id, item_id, item_name, supplier_item_name,
            quantity, suggested_quantity, unit_price, total_price,
            buffer, current_stock, projected_stock, created_at, updated_at
        FROM purchase_order_items
        WHERE po_id = $1
    `

	rows, err := r.db.QueryContext(ctx, itemsQuery, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get purchase order items: %w", err)
	}
	defer rows.Close()

	var items []models.PurchaseOrderItem
	for rows.Next() {
		var item models.PurchaseOrderItem
		err := rows.Scan(
			&item.ID,
			&item.POID,
			&item.ItemID,
			&item.ItemName,
			&item.SupplierItemName,
			&item.Quantity,
			&item.SuggestedQuantity,
			&item.UnitPrice,
			&item.TotalPrice,
			&item.Buffer,
			&item.CurrentStock,
			&item.ProjectedStock,
			&item.CreatedAt,
			&item.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan purchase order item: %w", err)
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating purchase order items: %w", err)
	}

	po.Items = items

	return po, nil
}

// GetAllPOs ดึงใบสั่งซื้อทั้งหมด
func (r *PurchaseOrderRepository) GetAllPOs(ctx context.Context, filters map[string]interface{}) ([]*models.PurchaseOrder, error) {
	// สร้าง query พื้นฐาน
	query := `
        SELECT 
            id, po_number, supplier_id, supplier_name, status,
            delivery_date, target_coverage_date, total_amount,
            notes, created_by, created_at, updated_at
        FROM purchase_orders
        WHERE 1=1
    `

	// เพิ่ม filters
	var args []interface{}
	argCounter := 1

	if supplierID, ok := filters["supplier_id"]; ok {
		query += fmt.Sprintf(" AND supplier_id = $%d", argCounter)
		args = append(args, supplierID)
		argCounter++
	}

	if status, ok := filters["status"]; ok {
		query += fmt.Sprintf(" AND status = $%d", argCounter)
		args = append(args, status)
		argCounter++
	}

	if startDate, ok := filters["start_date"]; ok {
		query += fmt.Sprintf(" AND delivery_date >= $%d", argCounter)
		args = append(args, startDate)
		argCounter++
	}

	if endDate, ok := filters["end_date"]; ok {
		query += fmt.Sprintf(" AND delivery_date <= $%d", argCounter)
		args = append(args, endDate)
		argCounter++
	}

	// เพิ่ม ORDER BY
	query += " ORDER BY created_at DESC"

	// ดึงข้อมูล
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get purchase orders: %w", err)
	}
	defer rows.Close()

	var pos []*models.PurchaseOrder
	for rows.Next() {
		po := &models.PurchaseOrder{}
		err := rows.Scan(
			&po.ID,
			&po.PONumber,
			&po.SupplierID,
			&po.SupplierName,
			&po.Status,
			&po.DeliveryDate,
			&po.TargetCoverageDate,
			&po.TotalAmount,
			&po.Notes,
			&po.CreatedBy,
			&po.CreatedAt,
			&po.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan purchase order: %w", err)
		}

		pos = append(pos, po)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating purchase orders: %w", err)
	}

	// ดึงรายการสินค้าสำหรับแต่ละ PO
	for _, po := range pos {
		items, err := r.GetPOItems(ctx, po.ID)
		if err != nil {
			return nil, err
		}

		for _, item := range items {
			po.Items = append(po.Items, *item)
		}
	}

	return pos, nil
}

// GetPOItems ดึงรายการสินค้าใน PO
func (r *PurchaseOrderRepository) GetPOItems(ctx context.Context, purchaseOrderID int) ([]*models.PurchaseOrderItem, error) {
	query := `
        SELECT 
            id, po_id, item_id, item_name, supplier_item_name,
            quantity, suggested_quantity, unit_price, total_price,
            buffer, current_stock, projected_stock, created_at, updated_at
        FROM purchase_order_items
        WHERE po_id = $1
    `

	rows, err := r.db.QueryContext(ctx, query, purchaseOrderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get purchase order items: %w", err)
	}
	defer rows.Close()

	var items []*models.PurchaseOrderItem
	for rows.Next() {
		item := &models.PurchaseOrderItem{}
		err := rows.Scan(
			&item.ID,
			&item.POID,
			&item.ItemID,
			&item.ItemName,
			&item.SupplierItemName,
			&item.Quantity,
			&item.SuggestedQuantity,
			&item.UnitPrice,
			&item.TotalPrice,
			&item.Buffer,
			&item.CurrentStock,
			&item.ProjectedStock,
			&item.CreatedAt,
			&item.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan purchase order item: %w", err)
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating purchase order items: %w", err)
	}

	return items, nil
}

// UpdatePO อัพเดทใบสั่งซื้อ
func (r *PurchaseOrderRepository) UpdatePO(ctx context.Context, po *models.PurchaseOrder) error {
	// เริ่มทำธุรกรรม
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// อัพเดทใบสั่งซื้อ
	query := `
        UPDATE purchase_orders
        SET 
            supplier_id = $1, supplier_name = $2, status = $3,
            delivery_date = $4, target_coverage_date = $5, total_amount = $6,
            notes = $7, updated_at = $8
        WHERE id = $9
    `

	now := time.Now()
	_, err = tx.ExecContext(
		ctx,
		query,
		po.SupplierID,
		po.SupplierName,
		po.Status,
		po.DeliveryDate,
		po.TargetCoverageDate,
		po.TotalAmount,
		po.Notes,
		now,
		po.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update purchase order: %w", err)
	}

	// อัพเดทรายการสินค้า (ลบทั้งหมดและสร้างใหม่)
	_, err = tx.ExecContext(ctx, "DELETE FROM purchase_order_items WHERE po_id = $1", po.ID)
	if err != nil {
		return fmt.Errorf("failed to delete purchase order items: %w", err)
	}

	// เพิ่มรายการสินค้าใหม่
	for i := range po.Items {
		item := &po.Items[i]
		item.POID = po.ID

		itemQuery := `
            INSERT INTO purchase_order_items (
                po_id, item_id, item_name, supplier_item_name,
                quantity, suggested_quantity, unit_price, total_price,
                buffer, current_stock, projected_stock, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id
        `

		err = tx.QueryRowContext(
			ctx,
			itemQuery,
			item.POID,
			item.ItemID,
			item.ItemName,
			item.SupplierItemName,
			item.Quantity,
			item.SuggestedQuantity,
			item.UnitPrice,
			item.TotalPrice,
			item.Buffer,
			item.CurrentStock,
			item.ProjectedStock,
			now,
			now,
		).Scan(&item.ID)

		if err != nil {
			return fmt.Errorf("failed to create purchase order item: %w", err)
		}
	}

	// ยืนยันธุรกรรม
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	po.UpdatedAt = now

	return nil
}

// DeletePO ลบใบสั่งซื้อ
func (r *PurchaseOrderRepository) DeletePO(ctx context.Context, id int) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM purchase_orders WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete purchase order: %w", err)
	}

	return nil
}

// AddPOItem เพิ่มรายการสินค้าในใบสั่งซื้อ
func (r *PurchaseOrderRepository) AddPOItem(ctx context.Context, item *models.PurchaseOrderItem) error {
	query := `
        INSERT INTO purchase_order_items (
            po_id, item_id, item_name, supplier_item_name,
            quantity, suggested_quantity, unit_price, total_price,
            buffer, current_stock, projected_stock, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
    `

	now := time.Now()
	err := r.db.QueryRowContext(
		ctx,
		query,
		item.POID,
		item.ItemID,
		item.ItemName,
		item.SupplierItemName,
		item.Quantity,
		item.SuggestedQuantity,
		item.UnitPrice,
		item.TotalPrice,
		item.Buffer,
		item.CurrentStock,
		item.ProjectedStock,
		now,
		now,
	).Scan(&item.ID)

	if err != nil {
		return fmt.Errorf("failed to add purchase order item: %w", err)
	}

	item.CreatedAt = now
	item.UpdatedAt = now

	return nil
}

// UpdatePOItem อัพเดทรายการสินค้าในใบสั่งซื้อ
func (r *PurchaseOrderRepository) UpdatePOItem(ctx context.Context, item *models.PurchaseOrderItem) error {
	query := `
        UPDATE purchase_order_items
        SET 
            item_name = $1, supplier_item_name = $2,
            quantity = $3, suggested_quantity = $4, unit_price = $5, total_price = $6,
            buffer = $7, current_stock = $8, projected_stock = $9, updated_at = $10
        WHERE id = $11
    `

	now := time.Now()
	_, err := r.db.ExecContext(
		ctx,
		query,
		item.ItemName,
		item.SupplierItemName,
		item.Quantity,
		item.SuggestedQuantity,
		item.UnitPrice,
		item.TotalPrice,
		item.Buffer,
		item.CurrentStock,
		item.ProjectedStock,
		now,
		item.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update purchase order item: %w", err)
	}

	item.UpdatedAt = now

	return nil
}

// DeletePOItem ลบรายการสินค้าในใบสั่งซื้อ
func (r *PurchaseOrderRepository) DeletePOItem(ctx context.Context, id int) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM purchase_order_items WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete purchase order item: %w", err)
	}

	return nil
}

// SaveBufferSettings บันทึกยอดเผื่อ
func (r *PurchaseOrderRepository) SaveBufferSettings(ctx context.Context, settings []models.BufferSettings) error {
	// เริ่มทำธุรกรรม
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// เตรียม statement
	stmt, err := tx.PrepareContext(ctx, `
        INSERT INTO buffer_settings (item_id, reserve_quantity, created_at, updated_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (item_id) 
        DO UPDATE SET reserve_quantity = EXCLUDED.reserve_quantity, updated_at = EXCLUDED.updated_at
    `)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	// บันทึกข้อมูลยอดเผื่อ
	for _, setting := range settings {
		_, err := stmt.ExecContext(ctx, setting.ItemID, setting.ReserveQuantity, setting.CreatedAt, setting.UpdatedAt)
		if err != nil {
			return fmt.Errorf("failed to save buffer setting: %w", err)
		}
	}

	// ยืนยันธุรกรรม
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetBufferSettings ดึงยอดเผื่อตาม item IDs
func (r *PurchaseOrderRepository) GetBufferSettings(ctx context.Context, itemIDs []string) (map[string]int, error) {
	if len(itemIDs) == 0 {
		return make(map[string]int), nil
	}

	// สร้าง placeholders สำหรับ IN clause
	placeholders := make([]string, len(itemIDs))
	args := make([]interface{}, len(itemIDs))
	for i, id := range itemIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}

	// ดึงยอดเผื่อ
	query := fmt.Sprintf(`
        SELECT item_id, reserve_quantity
        FROM buffer_settings
        WHERE item_id IN (%s)
    `, strings.Join(placeholders, ","))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get buffer settings: %w", err)
	}
	defer rows.Close()

	// สร้าง map เก็บผลลัพธ์
	bufferSettings := make(map[string]int)
	for rows.Next() {
		var itemID string
		var reserve int
		// GetBufferSettings (ต่อ) ดึงยอดเผื่อตาม item IDs
		if err := rows.Scan(&itemID, &reserve); err != nil {
			return nil, fmt.Errorf("failed to scan buffer setting: %w", err)
		}
		bufferSettings[itemID] = reserve
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating buffer settings: %w", err)
	}

	return bufferSettings, nil
}

// ใช้ฟังก์ชัน GetBufferSettingsBatch รับ item IDs จาก request body เพื่อหลีกเลี่ยงปัญหา URL ยาวเกินไป
func (r *PurchaseOrderRepository) GetBufferSettingsBatch(ctx context.Context, itemIDs []string) (map[string]int, error) {
	if len(itemIDs) == 0 {
		return make(map[string]int), nil
	}

	// สร้าง placeholders และ arguments สำหรับ IN query
	placeholders := make([]string, len(itemIDs))
	args := make([]interface{}, len(itemIDs))
	for i, id := range itemIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}

	// ดึงข้อมูล buffer settings จากฐานข้อมูล
	query := fmt.Sprintf(`
        SELECT item_id, reserve_quantity
        FROM buffer_settings
        WHERE item_id IN (%s)
    `, strings.Join(placeholders, ","))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get buffer settings: %w", err)
	}
	defer rows.Close()

	// สร้าง map เก็บผลลัพธ์
	bufferSettings := make(map[string]int)
	for rows.Next() {
		var itemID string
		var reserve int
		if err := rows.Scan(&itemID, &reserve); err != nil {
			return nil, fmt.Errorf("failed to scan buffer setting: %w", err)
		}
		bufferSettings[itemID] = reserve
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating buffer settings: %w", err)
	}

	return bufferSettings, nil
}
