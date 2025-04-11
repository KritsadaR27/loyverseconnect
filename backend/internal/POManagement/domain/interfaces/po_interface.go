// internal/POManagement/domain/interfaces/po_repository.go
package interfaces

import (
	"context"
	"time"

	"backend/internal/POManagement/domain/models"
)

// PurchaseOrderRepository กำหนด interface สำหรับ repository ของ PO
type PurchaseOrderRepository interface {
	// การจัดการ PO
	CreatePO(ctx context.Context, po *models.PurchaseOrder) error
	GetPOByID(ctx context.Context, id int) (*models.PurchaseOrder, error)
	GetAllPOs(ctx context.Context, filters map[string]interface{}) ([]*models.PurchaseOrder, error)
	UpdatePO(ctx context.Context, po *models.PurchaseOrder) error
	DeletePO(ctx context.Context, id int) error

	// การจัดการรายการสินค้าใน PO
	AddPOItem(ctx context.Context, item *models.PurchaseOrderItem) error
	GetPOItems(ctx context.Context, purchaseOrderID int) ([]*models.PurchaseOrderItem, error)
	UpdatePOItem(ctx context.Context, item *models.PurchaseOrderItem) error
	DeletePOItem(ctx context.Context, id int) error

	// การจัดการยอดเผื่อ
	SaveBufferSettings(ctx context.Context, settings []models.BufferSettings) error
	GetBufferSettings(ctx context.Context, itemIDs []string) (map[string]int, error)
	GetBufferSettingsBatch(ctx context.Context, itemIDs []string) (map[string]int, error)
}

// InventoryService กำหนด interface สำหรับเชื่อมต่อกับระบบ Inventory
type InventoryService interface {
	GetItemStock(ctx context.Context) ([]models.ItemStockData, error)
	GetStoreStock(ctx context.Context, itemIDs []string) (map[string][]models.StoreStock, error)
}

// SalesService กำหนด interface สำหรับเชื่อมต่อกับระบบ Sales
type SalesService interface {
	GetSalesByDay(ctx context.Context, startDate, endDate time.Time) ([]models.SalesByDay, error)
}

// LineService กำหนด interface สำหรับเชื่อมต่อกับระบบ Line
type LineService interface {
	SendMessage(ctx context.Context, groupIDs []string, message string) error
}
