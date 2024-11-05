// SaleManagement/domain/interfaces/receipt_interface.go
package interfaces

import "backend/internal/SaleManagement/domain/models"

type ReceiptRepository interface {
	FetchReceiptsWithDetails() ([]models.Receipt, error)
	FetchSalesByItem() ([]models.SaleItem, error)
	FetchSalesByDay() ([]models.SalesByDay, error)
}
