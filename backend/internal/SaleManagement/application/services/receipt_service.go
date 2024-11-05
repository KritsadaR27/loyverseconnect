// SaleManagement/application/services/receipt_service.go
package services

import (
	"backend/internal/SaleManagement/domain/interfaces"
	"backend/internal/SaleManagement/domain/models"
)

type ReceiptService struct {
	receiptRepo interfaces.ReceiptRepository
}

func NewReceiptService(repo interfaces.ReceiptRepository) *ReceiptService {
	return &ReceiptService{receiptRepo: repo}
}

func (s *ReceiptService) GetReceiptsWithDetails() ([]models.Receipt, error) {
	return s.receiptRepo.FetchReceiptsWithDetails()
}

// SaleManagement/application/services/receipt_service.go

func (s *ReceiptService) GetSalesByItem() ([]models.SaleItem, error) {
	return s.receiptRepo.FetchSalesByItem()
}

// SaleManagement/application/services/receipt_service.go

func (s *ReceiptService) GetSalesByDay() ([]models.SalesByDay, error) {
	return s.receiptRepo.FetchSalesByDay()
}
