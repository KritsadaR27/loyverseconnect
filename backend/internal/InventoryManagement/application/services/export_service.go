// backend/internal/InventoryManagement/application/services/export_service.go
package services

import (
	"context"
	"fmt"

	"backend/internal/InventoryManagement/domain/interfaces"

	"google.golang.org/api/sheets/v4"
)

type ExportService struct {
	itemInterface interfaces.ItemInterface
	sheetsClient  *sheets.Service
	spreadsheetID string
	sheetRange    string
}

func NewExportService(itemInterface interfaces.ItemInterface, sheetsClient *sheets.Service) *ExportService {
	return &ExportService{
		itemInterface: itemInterface,
		sheetsClient:  sheetsClient,
		spreadsheetID: "143oyrxaUhx48sDXv144YMwPhqPa02rbSMtfU3fjAHfs", // คุณสามารถย้ายไป env หรือ secret ได้
		sheetRange:    "itemstockdata!A:E",
	}
}
func (s *ExportService) ExportItemStockDataToGoogleSheet() error {
	ctx := context.Background()

	// Step 1: ล้างข้อมูลเก่า
	clearReq := &sheets.ClearValuesRequest{}
	_, err := s.sheetsClient.Spreadsheets.Values.Clear(s.spreadsheetID, s.sheetRange, clearReq).Context(ctx).Do()
	if err != nil {
		return fmt.Errorf("failed to clear sheet: %v", err)
	}

	// Step 2: ดึงข้อมูล
	itemStockData, err := s.itemInterface.FetchItemStockData()
	if err != nil {
		return err
	}

	// Step 3: เตรียมข้อมูลใหม่
	var values [][]interface{}
	for _, item := range itemStockData {
		values = append(values, []interface{}{
			item.ItemName,
			item.InStock,
			item.StoreName,
			item.CategoryName,
			item.SupplierName,
		})
	}

	// Step 4: เขียนลง Google Sheets
	_, err = s.sheetsClient.Spreadsheets.Values.Append(s.spreadsheetID, s.sheetRange, &sheets.ValueRange{
		Values: values,
	}).ValueInputOption("RAW").InsertDataOption("INSERT_ROWS").Context(ctx).Do()

	if err != nil {
		return fmt.Errorf("failed to write to sheet: %v", err)
	}

	return nil
}
