package main

import (
	"context"
	"fmt"
	"log"

	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

const (
	spreadsheetID = "1hTKFAJEDP0RS8LiDFBsdaUXMC2dG50v-9BUIT-4n0iU"
	sheetName     = "golist"
)

func main() {
	ctx := context.Background()
	srv, err := sheets.NewService(ctx, option.WithCredentialsFile("credentials.json"))
	if err != nil {
		log.Fatalf("Unable to retrieve Sheets client: %v", err)
	}

	// Prepare data to write
	values := [][]interface{}{
		{"Test", "Google", "Sheet", "Success"},
		{"This is a", "test row", "in the sheet"},
	}

	// Write data to sheet
	rangeToUpdate := fmt.Sprintf("%s!A1", sheetName)
	_, err = srv.Spreadsheets.Values.Update(spreadsheetID, rangeToUpdate, &sheets.ValueRange{
		Values: values,
	}).ValueInputOption("RAW").Do()
	if err != nil {
		log.Fatalf("Unable to write data to Google Sheets: %v", err)
	}
	fmt.Println("Data written successfully!")
}
