// backend/internal/InventoryManagement/application/services/google_sheets_client.go
package services

type GoogleSheetsClient interface {
	ExportDataToGoogleSheet(data [][]interface{}) error
}
