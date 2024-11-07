// services/sales_service.go
package services

import (
	"backend/internal/SaleManagement/domain/interfaces"
	"backend/internal/SaleManagement/domain/models"

	"time"
)

type SalesService struct {
	repo interfaces.SalesRepository
}

func NewSalesService(repo interfaces.SalesRepository) *SalesService {
	return &SalesService{repo: repo}
}

func (s *SalesService) GetMonthlyCategorySales(startDate, endDate time.Time) ([]models.MonthlyCategorySales, error) {
	return s.repo.FetchMonthlyCategorySales(startDate, endDate)
}
