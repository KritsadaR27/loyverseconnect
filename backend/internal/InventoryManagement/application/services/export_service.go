// backend/internal/InventoryManagement/application/services/export_service.go
package services

import (
	"backend/internal/InventoryManagement/domain/interfaces"
	"backend/internal/InventoryManagement/infrastructure/external"
)

type ExportService struct {
	itemInterface interfaces.ItemInterface
	sheetsClient  *external.GoogleSheetsClient
}

func NewExportService(itemInterface interfaces.ItemInterface, sheetsClient *external.GoogleSheetsClient) *ExportService {
	return &ExportService{itemInterface: itemInterface, sheetsClient: sheetsClient}
}

func (s *ExportService) ExportItemStockDataToGoogleSheet() error {
	// Clear existing data in Google Sheet before writing new data
	err := s.sheetsClient.ClearSheet()
	if err != nil {
		return err
	}
	itemStockData, err := s.itemInterface.FetchItemStockData()
	if err != nil {
		return err
	}

	var values [][]interface{}
	for _, item := range itemStockData {
		supplierName := item.SupplierName
		if supplierName == "" {
			supplierName = "ไม่ทราบ"
		}

		values = append(values, []interface{}{
			item.ItemName,
			item.InStock,
			item.StoreName,
			item.CategoryName,
			supplierName,
		})
	}

	return s.sheetsClient.ExportDataToGoogleSheet(values)
}
