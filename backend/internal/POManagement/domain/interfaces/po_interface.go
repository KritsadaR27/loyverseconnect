package interfaces

import (
	"context"

	"backend/internal/POManagement/domain/models"
)

// PurchaseOrderRepository defines the interface for purchase order data operations
type PurchaseOrderRepository interface {
	// Purchase Order operations
	CreatePO(ctx context.Context, po *models.PurchaseOrder) error
	GetPOByID(ctx context.Context, id int) (*models.PurchaseOrder, error)
	GetAllPOs(ctx context.Context) ([]*models.PurchaseOrder, error)
	UpdatePO(ctx context.Context, po *models.PurchaseOrder) error
	DeletePO(ctx context.Context, id int) error

	// Purchase Order Item operations
	AddPOItem(ctx context.Context, item *models.PurchaseOrderItem) error
	GetPOItems(ctx context.Context, purchaseOrderID int) ([]*models.PurchaseOrderItem, error)
	UpdatePOItem(ctx context.Context, item *models.PurchaseOrderItem) error
	DeletePOItem(ctx context.Context, id int) error
}

// PurchaseOrderService defines the interface for purchase order business logic
type PurchaseOrderService interface {
	CreatePurchaseOrder(ctx context.Context, po *models.PurchaseOrder) error
	GetPurchaseOrderByID(ctx context.Context, id int) (*models.PurchaseOrder, error)
	GetAllPurchaseOrders(ctx context.Context) ([]*models.PurchaseOrder, error)
	UpdatePurchaseOrder(ctx context.Context, po *models.PurchaseOrder) error
	DeletePurchaseOrder(ctx context.Context, id int) error

	AddItemToPurchaseOrder(ctx context.Context, item *models.PurchaseOrderItem) error
	GetPurchaseOrderItems(ctx context.Context, purchaseOrderID int) ([]*models.PurchaseOrderItem, error)
	UpdatePurchaseOrderItem(ctx context.Context, item *models.PurchaseOrderItem) error
	DeletePurchaseOrderItem(ctx context.Context, id int) error

	ApprovePurchaseOrder(ctx context.Context, poID int, approverID string) error
	RejectPurchaseOrder(ctx context.Context, poID int, approverID string, reason string) error
	CancelPurchaseOrder(ctx context.Context, poID int, reason string) error
}
