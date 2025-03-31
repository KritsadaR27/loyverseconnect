package data

import (
	"context"
	"database/sql"

	"backend/internal/POManagement/domain/interfaces"
	"backend/internal/POManagement/domain/models"
)

// PurchaseOrderRepo implements the PurchaseOrderRepository interface
type PurchaseOrderRepo struct {
	db *sql.DB
}

// NewPurchaseOrderRepo creates a new purchase order repository
func NewPurchaseOrderRepo(db *sql.DB) interfaces.PurchaseOrderRepository {
	return &PurchaseOrderRepo{
		db: db,
	}
}

// AddPOItem implements interfaces.PurchaseOrderRepository
func (r *PurchaseOrderRepo) AddPOItem(ctx context.Context, item *models.PurchaseOrderItem) error {
	query := `
		INSERT INTO po_items (
			po_id, product_id, quantity, unit_price, total_price
		) VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		item.POID,
		item.ProductID,
		item.Quantity,
		item.UnitPrice,
		item.TotalPrice,
	).Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)
}

// CreatePO implements interfaces.PurchaseOrderRepository
func (r *PurchaseOrderRepo) CreatePO(ctx context.Context, po *models.PurchaseOrder) error {
	query := `
        INSERT INTO purchase_orders (
            po_number, supplier_id, status, order_date, expected_delivery_date, 
            total_amount, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, created_at, updated_at
    `

	return r.db.QueryRowContext(
		ctx,
		query,
		po.PONumber,
		po.SupplierID,
		po.Status,
		po.OrderDate,
		po.ExpectedDeliveryDate,
		po.TotalAmount,
		po.Notes,
		po.CreatedBy,
	).Scan(&po.ID, &po.CreatedAt, &po.UpdatedAt)
}

// GetPOByID implements interfaces.PurchaseOrderRepository
func (r *PurchaseOrderRepo) GetPOByID(ctx context.Context, id int) (*models.PurchaseOrder, error) {
	query := `
        SELECT id, po_number, supplier_id, status, order_date, 
               expected_delivery_date, total_amount, notes, 
               created_by, created_at, updated_at
        FROM purchase_orders 
        WHERE id = $1
    `

	po := &models.PurchaseOrder{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&po.ID, &po.PONumber, &po.SupplierID, &po.Status,
		&po.OrderDate, &po.ExpectedDeliveryDate, &po.TotalAmount,
		&po.Notes, &po.CreatedBy, &po.CreatedAt, &po.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	// Fetch PO items
	items, err := r.GetPOItems(ctx, id)
	if err != nil {
		return nil, err
	}
	po.Items = items

	return po, nil
}

// GetPOItems implements interfaces.PurchaseOrderRepository
func (r *PurchaseOrderRepo) GetPOItems(ctx context.Context, poID int) ([]*models.PurchaseOrderItem, error) {
	query := `
        SELECT id, po_id, product_id, quantity, unit_price, 
               total_price, created_at, updated_at
        FROM po_items 
        WHERE po_id = $1
    `

	rows, err := r.db.QueryContext(ctx, query, poID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*models.PurchaseOrderItem
	for rows.Next() {
		item := &models.PurchaseOrderItem{}
		err := rows.Scan(
			&item.ID, &item.POID, &item.ProductID, &item.Quantity,
			&item.UnitPrice, &item.TotalPrice, &item.CreatedAt, &item.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}
