package google_sheets

import (
	"context"

	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

func NewSheetsService(credentialsFile string) (*sheets.Service, error) {
	ctx := context.Background()
	return sheets.NewService(ctx, option.WithCredentialsFile(credentialsFile))
}

func ExportDataToGoogleSheet(srv *sheets.Service, spreadsheetID, rangeData string, values [][]interface{}) error {
	body := &sheets.ValueRange{
		Range:  rangeData,
		Values: values,
	}
	_, err := srv.Spreadsheets.Values.Update(spreadsheetID, rangeData, body).ValueInputOption("RAW").Do()
	return err
}
