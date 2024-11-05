// backend/internal/InventoryManagement/infrastructure/external/google_sheets_client.go
package external

import (
	"context"
	"errors"

	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

type GoogleSheetsClient struct {
	service       *sheets.Service
	spreadsheetID string
	rangeData     string
}

func NewGoogleSheetsClient(credentialsFile, spreadsheetID, rangeData string) (*GoogleSheetsClient, error) {
	ctx := context.Background()
	srv, err := sheets.NewService(ctx, option.WithCredentialsFile(credentialsFile))
	if err != nil {
		return nil, err
	}

	return &GoogleSheetsClient{
		service:       srv,
		spreadsheetID: spreadsheetID,
		rangeData:     rangeData,
	}, nil
}
func (client *GoogleSheetsClient) ClearSheet() error {
	if client.service == nil {
		return errors.New("Google Sheets service not initialized")
	}

	clearRange := &sheets.ClearValuesRequest{}
	_, err := client.service.Spreadsheets.Values.Clear(client.spreadsheetID, client.rangeData, clearRange).Do()
	return err
}
func (client *GoogleSheetsClient) ExportDataToGoogleSheet(data [][]interface{}) error {
	if client.service == nil {
		return errors.New("Google Sheets service not initialized")
	}

	valueRange := &sheets.ValueRange{
		Range:  client.rangeData,
		Values: data,
	}

	_, err := client.service.Spreadsheets.Values.Update(client.spreadsheetID, client.rangeData, valueRange).
		ValueInputOption("RAW").
		Do()
	return err
}
