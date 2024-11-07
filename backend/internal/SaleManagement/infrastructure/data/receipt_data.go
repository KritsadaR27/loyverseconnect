// SaleManagement/infrastructure/data/receipt_data.go
package data

import (
	"backend/internal/SaleManagement/domain/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/lib/pq"
)

type ReceiptRepository struct {
	db *sql.DB
}

// / helper function to convert sql.NullString to string
func nullStringToString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return "ไม่ทราบ" // ค่าที่ต้องการแสดงแทน NULL
}
func NewReceiptRepository(db *sql.DB) *ReceiptRepository {
	return &ReceiptRepository{db: db}
}

func (repo *ReceiptRepository) FetchReceiptsWithDetails(limit, offset int) ([]models.Receipt, error) {
	var receipts []models.Receipt
	query := `
       SELECT 
            r.receipt_date AS ReceiptDate,
            r.receipt_number AS ReceiptNumber,
            r.total_money AS TotalMoney,
            r.total_discount AS TotalDiscount,
            s.store_name AS StoreName,
            array_agg(DISTINCT pt.name) AS PaymentNames,
            CASE 
                WHEN r.cancelled_at IS NOT NULL THEN 'ยกเลิก' 
                ELSE 'ขาย' 
            END AS Status,
            jsonb_agg(li) AS LineItems
        FROM 
            loyreceipts r
        JOIN 
            loystores s ON r.store_id = s.store_id
        LEFT JOIN 
            jsonb_array_elements(r.line_items) AS li ON TRUE
        LEFT JOIN 
            jsonb_array_elements(r.payments) AS p ON TRUE
        LEFT JOIN 
            loypaymenttypes pt ON (p->>'payment_type_id') = pt.payment_type_id
        GROUP BY 
            r.receipt_date, r.receipt_number, r.total_money, r.total_discount, s.store_name, r.cancelled_at
        ORDER BY 
            r.receipt_date DESC, r.receipt_number
        LIMIT $1 OFFSET $2;
    `

	rows, err := repo.db.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var receipt models.Receipt
		var paymentNames []string // For the array of payment names
		var lineItemsData []byte  // For the JSON of line items
		var status string         // Sale status, e.g., "ขาย" or "ยกเลิก"

		// Use `pq.Array(&paymentNames)` to read array of payment names
		err := rows.Scan(
			&receipt.ReceiptDate,
			&receipt.ReceiptNumber,
			&receipt.TotalMoney,
			&receipt.TotalDiscount,
			&receipt.StoreName,
			pq.Array(&paymentNames), // Use `pq.Array` to read array of payment names
			&status,                 // Sale status
			&lineItemsData,          // JSON for LineItems
		)
		if err != nil {
			return nil, err
		}

		// Convert `ReceiptDate` to Bangkok time
		loc, _ := time.LoadLocation("Asia/Bangkok")
		receipt.ReceiptDate = receipt.ReceiptDate.In(loc)

		// Unmarshal JSON `lineItemsData` to `[]models.LineItem`
		if err := json.Unmarshal(lineItemsData, &receipt.LineItems); err != nil {
			return nil, fmt.Errorf("error unmarshalling line items: %w", err)
		}

		// Generate `LineItemsSummary`
		var lineItemsSummary string
		for _, item := range receipt.LineItems {
			lineItemsSummary += fmt.Sprintf("%s x %.0f, ", item.ItemName, item.Quantity)
		}

		// Remove trailing comma and space
		if len(lineItemsSummary) > 2 {
			lineItemsSummary = lineItemsSummary[:len(lineItemsSummary)-2]
		}
		receipt.LineItemsSummary = lineItemsSummary

		// Set fields for PaymentNames and Status
		receipt.PaymentNames = paymentNames
		receipt.Status = status

		// Append the prepared receipt to the `receipts` slice
		receipts = append(receipts, receipt)
	}

	return receipts, nil
}

func (repo *ReceiptRepository) FetchSalesByItem(limit, offset int) ([]models.SaleItem, error) {
	var salesByItem []models.SaleItem
	query := `SELECT 
        r.receipt_date AS ReceiptDate,
        li->>'item_name' AS ItemName,
        SUM((li->>'quantity')::numeric) AS Quantity,
        SUM((li->>'price')::numeric * (li->>'quantity')::numeric) AS TotalSales,
        SUM((li->>'cost')::numeric * (li->>'quantity')::numeric) AS TotalCost,
        r.total_discount AS TotalDiscount,
        array_agg(DISTINCT pt.name) AS PaymentNames,
        CASE 
            WHEN r.cancelled_at IS NOT NULL THEN 'ยกเลิก' 
            ELSE 'ขาย' 
        END AS Status,
        COALESCE(c.name, 'ไม่ทราบ') AS CategoryName,
        s.store_name AS StoreName,
        r.receipt_number AS ReceiptNumber
    FROM 
        loyreceipts r
    JOIN 
        loystores s ON r.store_id = s.store_id
    LEFT JOIN 
        jsonb_array_elements(r.line_items) AS li ON TRUE
    LEFT JOIN 
        loyitems i ON (li->>'item_id') = i.item_id
    LEFT JOIN 
        loycategories c ON i.category_id = c.category_id
    LEFT JOIN 
        jsonb_array_elements(r.payments) AS p ON TRUE
    LEFT JOIN 
        loypaymenttypes pt ON (p->>'payment_type_id') = pt.payment_type_id
    WHERE 
        r.cancelled_at IS NULL
    GROUP BY 
        ReceiptDate, ItemName, CategoryName, StoreName, ReceiptNumber, Status
    ORDER BY 
        ReceiptDate DESC, ItemName
    LIMIT $1 OFFSET $2;
    `

	rows, err := repo.db.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var saleItem models.SaleItem
		var categoryName sql.NullString
		var paymentNames []string // Handle as []string for pq.Array

		var receiptDate time.Time
		err := rows.Scan(
			&receiptDate,
			&saleItem.ItemName,
			&saleItem.Quantity,
			&saleItem.TotalSales,
			&saleItem.TotalCost,
			&saleItem.TotalDiscount,
			pq.Array(&paymentNames), // Use pq.Array to parse PostgreSQL array
			&saleItem.Status,
			&categoryName,
			&saleItem.StoreName,
			&saleItem.ReceiptNumber,
		)
		if err != nil {
			return nil, err
		}

		// Convert the receipt date to Bangkok time
		loc, _ := time.LoadLocation("Asia/Bangkok")
		saleItem.ReceiptDate = receiptDate.In(loc)

		// Assign parsed array to saleItem.PaymentNames
		saleItem.PaymentNames = paymentNames

		// Convert sql.NullString to regular string
		saleItem.CategoryName = nullStringToString(categoryName)

		salesByItem = append(salesByItem, saleItem)
	}

	return salesByItem, nil
}

// Add startDate and endDate parameters
func (repo *ReceiptRepository) FetchSalesByDay(startDate, endDate time.Time) ([]models.SalesByDay, error) {
	var salesByDay []models.SalesByDay
	query := `
        SELECT 
			DATE_TRUNC('day', r.receipt_date - INTERVAL '17 hours') + INTERVAL '1 day' AS SaleDate,
			li->>'item_name' AS ItemName,
			SUM((li->>'quantity')::numeric) AS TotalQuantity,
			SUM((li->>'price')::numeric * (li->>'quantity')::numeric) AS TotalSales,
			SUM((li->>'quantity')::numeric * ((li->>'price')::numeric - (li->>'cost')::numeric)) AS TotalProfit
		FROM 
			loyreceipts r
		LEFT JOIN 
			jsonb_array_elements(r.line_items) AS li ON TRUE
		WHERE 
			r.cancelled_at IS NULL
			AND r.receipt_date BETWEEN $1 AND $2
		GROUP BY 
			SaleDate, ItemName
		ORDER BY 
			SaleDate, ItemName;

    `

	rows, err := repo.db.Query(query, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var saleByDay models.SalesByDay
		var saleDate time.Time
		err := rows.Scan(&saleDate, &saleByDay.ItemName, &saleByDay.TotalQuantity, &saleByDay.TotalSales, &saleByDay.TotalProfit)
		if err != nil {
			return nil, err
		}
		// Convert the receipt date to Bangkok time
		loc, _ := time.LoadLocation("Asia/Bangkok")
		saleByDay.SaleDate = saleDate.In(loc)

		salesByDay = append(salesByDay, saleByDay)
	}
	return salesByDay, nil
}
