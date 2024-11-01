package loyhandlers

import (
	"backend/database"
	"backend/models"
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

func GetItemStockDataHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		itemStockData, err := database.FetchItemStockData(db)
		if err != nil {
			log.Printf("Error fetching item stock data: %v", err) // Log the error
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(itemStockData)
	}
}

// ExportToGoogleSheetHandler ส่งข้อมูลสินค้าพร้อมสถานะสต็อกไปยัง Google Sheets
func ExportToGoogleSheetHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// ดึงข้อมูลสินค้าจากฐานข้อมูล
		itemStockData, err := database.FetchItemStockData(db)
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		// ส่งข้อมูลไปยัง Google Sheets
		if err := exportToGoogleSheet(itemStockData); err != nil {
			log.Printf("Error exporting to Google Sheet: %v", err)
			http.Error(w, "Failed to export to Google Sheet", http.StatusInternalServerError)
			return
		}

		// ตอบกลับว่า ส่งข้อมูลสำเร็จ
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Data exported to Google Sheet successfully!"))
	}
}
func exportToGoogleSheet(data []models.ItemStockData) error {
	ctx := context.Background()
	srv, err := sheets.NewService(ctx, option.WithCredentialsFile("credentials.json"))
	if err != nil {
		return err
	}

	spreadsheetID := "143oyrxaUhx48sDXv144YMwPhqPa02rbSMtfU3fjAHfs"
	rangeData := "itemstockdata!A1"

	var values [][]interface{}
	for _, item := range data {
		supplierName := item.SupplierName.String // ใช้ field String ของ sql.NullString
		if !item.SupplierName.Valid {            // ตรวจสอบว่า Valid เป็น true หรือไม่
			supplierName = "ไม่ทราบ" // กำหนดค่าภาพแทนถ้าว่าง
		}
		values = append(values, []interface{}{
			item.ItemName,
			item.InStock,
			item.StoreName,
			item.CategoryName,
			supplierName,
		})
	}

	body := &sheets.ValueRange{
		Range:  rangeData,
		Values: values,
	}

	_, err = srv.Spreadsheets.Values.Update(spreadsheetID, rangeData, body).
		ValueInputOption("RAW").Do()
	return err
}
