// SaleManagement/application/services/receipt_service.go
package services

import (
	"backend/internal/SaleManagement/domain/interfaces"
	"backend/internal/SaleManagement/domain/models"
	"time"
)

type ReceiptService struct {
	receiptRepo interfaces.ReceiptRepository
}

func NewReceiptService(repo interfaces.ReceiptRepository) *ReceiptService {
	return &ReceiptService{receiptRepo: repo}
}

func (s *ReceiptService) GetReceiptsWithDetails(pageSize, offset int) ([]models.Receipt, error) {
	return s.receiptRepo.FetchReceiptsWithDetails(pageSize, offset)
}

// SaleManagement/application/services/receipt_service.go

func (s *ReceiptService) GetSalesByItem(limit, offset int) ([]models.SaleItem, error) {
	return s.receiptRepo.FetchSalesByItem(limit, offset)
}

// SaleManagement/application/services/receipt_service.go

// In your service (ReceiptService)
func (s *ReceiptService) GetSalesByDay(startDate, endDate time.Time) ([]models.SalesByDay, error) {
	return s.receiptRepo.FetchSalesByDay(startDate, endDate)
}
