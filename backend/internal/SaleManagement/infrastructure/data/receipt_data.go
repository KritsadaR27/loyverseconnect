// SaleManagement/infrastructure/data/receipt_data.go
package data

import (
	"backend/internal/SaleManagement/domain/models"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/lib/pq"
)

type ReceiptRepository struct {
	db *sql.DB
}

func NewReceiptRepository(db *sql.DB) *ReceiptRepository {
	return &ReceiptRepository{db: db}
}

func (repo *ReceiptRepository) FetchReceiptsWithDetails() ([]models.Receipt, error) {
	var receipts []models.Receipt
	query := `
        SELECT 
            r.receipt_date AS ReceiptDate,
            r.receipt_number AS ReceiptNumber,
            r.total_money AS TotalMoney,
            r.total_discount AS TotalDiscount,
            s.store_name AS StoreName,
            array_agg(DISTINCT pt.name) AS PaymentNames,  -- ใช้ DISTINCT เพื่อหลีกเลี่ยงการซ้ำกัน
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
            r.receipt_date DESC, r.receipt_number;
    `

	rows, err := repo.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var receipt models.Receipt
		var paymentNames []string // ใช้สำหรับ array ของ payment names
		var lineItemsData []byte  // ใช้สำหรับ JSON ของ line items
		var status string         // สถานะการขาย เช่น "ขาย" หรือ "ยกเลิก"

		// ใช้ `pq.Array(&paymentNames)` เพื่ออ่าน array ของ payment names
		err := rows.Scan(
			&receipt.ReceiptDate,
			&receipt.ReceiptNumber,
			&receipt.TotalMoney,
			&receipt.TotalDiscount,
			&receipt.StoreName,
			pq.Array(&paymentNames), // ใช้ `pq.Array` เพื่ออ่าน array ของ payment names
			&status,                 // สถานะการขาย
			&lineItemsData,          // JSON ของ LineItems
		)
		if err != nil {
			return nil, err
		}

		// แปลง JSON `lineItemsData` ให้เป็นโครงสร้าง `[]models.LineItem`
		if err := json.Unmarshal(lineItemsData, &receipt.LineItems); err != nil {
			return nil, fmt.Errorf("error unmarshalling line items: %w", err)
		}

		// สร้าง `LineItemsSummary`
		var lineItemsSummary string
		for _, item := range receipt.LineItems {
			lineItemsSummary += fmt.Sprintf("%s x %.0f, ", item.ItemName, item.Quantity)
		}

		// ลบคอมมาและเว้นวรรคที่ท้าย string
		if len(lineItemsSummary) > 2 {
			lineItemsSummary = lineItemsSummary[:len(lineItemsSummary)-2]
		}
		receipt.LineItemsSummary = lineItemsSummary

		// ตั้งค่าฟิลด์ PaymentNames และ Status
		receipt.PaymentNames = paymentNames
		receipt.Status = status

		// เพิ่ม receipt ที่จัดเตรียมไว้ใน `receipts` slice
		receipts = append(receipts, receipt)
	}

	return receipts, nil
}

func (repo *ReceiptRepository) FetchSalesByItem() ([]models.SaleItem, error) {
	var salesByItem []models.SaleItem
	query := `SELECT 
        r.receipt_date AS ReceiptDate,
        li->>'item_name' AS ItemName,
        SUM((li->>'quantity')::numeric) AS Quantity,
        SUM((li->>'price')::numeric * (li->>'quantity')::numeric) AS TotalSales,
        SUM((li->>'cost')::numeric * (li->>'quantity')::numeric) AS TotalCost,
        r.total_discount AS TotalDiscount,
        pt.name AS PaymentName,
        CASE 
            WHEN r.cancelled_at IS NOT NULL THEN 'ยกเลิก' 
            ELSE 'ขาย' 
        END AS Status,
        c.category_name AS CategoryName,
        s.store_name AS StoreName,
        r.receipt_number AS ReceiptNumber
    FROM 
        loyreceipts r
    JOIN 
        loystores s ON r.store_id = s.store_id
    LEFT JOIN 
        jsonb_array_elements(r.line_items) AS li ON TRUE
    LEFT JOIN 
        categories c ON (li->>'category_id') = c.category_id
    LEFT JOIN 
        jsonb_array_elements(r.payments) AS p ON TRUE
    LEFT JOIN 
        loypaymenttypes pt ON (p->>'payment_type_id') = pt.payment_type_id
    WHERE 
        r.cancelled_at IS NULL
    GROUP BY 
        ReceiptDate, ItemName, PaymentName, CategoryName, StoreName, ReceiptNumber, Status
    ORDER BY 
        ReceiptDate DESC, ItemName;
    `

	rows, err := repo.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var saleItem models.SaleItem
		err := rows.Scan(&saleItem.ReceiptDate, &saleItem.ItemName, &saleItem.Quantity, &saleItem.TotalSales, &saleItem.TotalCost, &saleItem.TotalDiscount, &saleItem.PaymentName, &saleItem.Status, &saleItem.CategoryName, &saleItem.StoreName, &saleItem.ReceiptNumber)
		if err != nil {
			return nil, err
		}
		salesByItem = append(salesByItem, saleItem)
	}
	return salesByItem, nil
}

func (repo *ReceiptRepository) FetchSalesByDay() ([]models.SalesByDay, error) {
	var salesByDay []models.SalesByDay
	query := `SELECT 
        DATE(r.receipt_date) AS SaleDate,
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
    GROUP BY 
        SaleDate, ItemName
    ORDER BY 
        SaleDate, ItemName;
    `

	rows, err := repo.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var saleByDay models.SalesByDay
		err := rows.Scan(&saleByDay.SaleDate, &saleByDay.ItemName, &saleByDay.TotalQuantity, &saleByDay.TotalSales, &saleByDay.TotalProfit)
		if err != nil {
			return nil, err
		}
		salesByDay = append(salesByDay, saleByDay)
	}
	return salesByDay, nil
}
