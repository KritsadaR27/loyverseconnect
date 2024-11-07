package data

import (
	"backend/internal/SaleManagement/domain/interfaces"
	"backend/internal/SaleManagement/domain/models"
	"database/sql"
	"time"
)

type SalesRepository struct {
	db *sql.DB
}

func NewSalesRepository(db *sql.DB) interfaces.SalesRepository {
	return &SalesRepository{db: db}
}

func (repo *SalesRepository) FetchMonthlyCategorySales(startDate, endDate time.Time) ([]models.MonthlyCategorySales, error) {
	query := `
		SELECT 
			DATE_TRUNC('month', r.receipt_date AT TIME ZONE 'Asia/Bangkok') AS SaleMonth,
			COALESCE(c.name, 'ไม่ทราบ') AS CategoryName,
			SUM((li->>'quantity')::numeric) AS TotalQuantity,
			SUM((li->>'price')::numeric * (li->>'quantity')::numeric) AS TotalSales,
			SUM((li->>'quantity')::numeric * ((li->>'price')::numeric - (li->>'cost')::numeric)) AS TotalProfit
		FROM 
			loyreceipts r
		LEFT JOIN 
			jsonb_array_elements(r.line_items) AS li ON TRUE
		LEFT JOIN 
			loyitems i ON (li->>'item_id')::text = i.item_id
		LEFT JOIN 
			loycategories c ON i.category_id = c.category_id
		WHERE 
			r.cancelled_at IS NULL
			AND r.receipt_date AT TIME ZONE 'Asia/Bangkok' BETWEEN $1 AND $2
		GROUP BY 
			SaleMonth, CategoryName
		ORDER BY 
			SaleMonth, CategoryName;
	`

	// Adjust the end date to be inclusive of the entire day
	location, _ := time.LoadLocation("Asia/Bangkok")
	startDate = startDate.In(location)
	endDate = endDate.AddDate(0, 0, 1).In(location) // Add 1 day to include the full end date

	// Execute the query with the adjusted dates
	rows, err := repo.db.Query(query, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.MonthlyCategorySales
	for rows.Next() {
		var sale models.MonthlyCategorySales
		if err := rows.Scan(&sale.SaleMonth, &sale.CategoryName, &sale.TotalQuantity, &sale.TotalSales, &sale.TotalProfit); err != nil {
			return nil, err
		}
		results = append(results, sale)
	}
	return results, nil
}
