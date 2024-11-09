// infrastructure/repositories/supplier_repository.go
package data

import (
	"backend/internal/SupplierManagement/domain/models"
	"database/sql"
	"fmt"
	"log"

	"github.com/lib/pq"
)

type SupplierRepository struct {
	db *sql.DB
}

func NewSupplierRepository(db *sql.DB) *SupplierRepository {
	return &SupplierRepository{db: db}
}

func (repo *SupplierRepository) GetSuppliers() ([]models.SupplierWithCustomFields, error) {
	var suppliers []models.SupplierWithCustomFields

	query := `
       SELECT 
    ls.supplier_id, 
    ls.supplier_name, 
    COALESCE(csf.order_cycle, '') AS order_cycle, 
    COALESCE(csf.selected_days, ARRAY[]::text[]) AS selected_days, 
    COALESCE(csf.sort_order, 0) AS sort_order
FROM 
    loysuppliers ls
LEFT JOIN 
    custom_supplier_fields csf ON ls.supplier_id = csf.supplier_id;

    `
	rows, err := repo.db.Query(query)
	if err != nil {
		log.Printf("Error executing GetSuppliers query: %v\nQuery: %s", err, query)
		return nil, fmt.Errorf("error querying suppliers: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var supplier models.SupplierWithCustomFields
		var selectedDays []string

		if err := rows.Scan(
			&supplier.SupplierID,
			&supplier.SupplierName,
			&supplier.OrderCycle,
			pq.Array(&selectedDays),
			&supplier.SortOrder,
		); err != nil {
			log.Printf("Error scanning supplier row: %v\n", err)
			return nil, fmt.Errorf("error scanning supplier row: %w", err)
		}

		// Handle nullable fields
		if !supplier.OrderCycle.Valid {
			supplier.OrderCycle.String = "" // Set default value if NULL
		}

		if supplier.SortOrder.Valid {
			// SortOrder is valid, use it directly
		} else {
			supplier.SortOrder.Int64 = 0 // Set default value if NULL
		}

		supplier.SelectedDays = selectedDays
		suppliers = append(suppliers, supplier)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Row error after iterating suppliers: %v\n", err)
		return nil, fmt.Errorf("row error after iterating suppliers: %w", err)
	}

	log.Printf("Fetched %d suppliers\n", len(suppliers))
	return suppliers, nil
}

// SaveCustomSupplierFields saves or updates order_cycle, selected_days, and sort_order in custom_supplier_fields
func (repo *SupplierRepository) SaveCustomSupplierFields(supplierFields []models.CustomSupplierField) error {
	tx, err := repo.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
        INSERT INTO custom_supplier_fields (supplier_id, order_cycle, selected_days, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (supplier_id) DO UPDATE
        SET order_cycle = EXCLUDED.order_cycle,
            selected_days = EXCLUDED.selected_days,
            sort_order = EXCLUDED.sort_order
    `)
	if err != nil {
		return fmt.Errorf("error preparing statement: %v", err)
	}
	defer stmt.Close()

	for _, supplier := range supplierFields {
		// Use pq.Array to handle selected_days as an array
		_, err := stmt.Exec(
			supplier.SupplierID,
			supplier.OrderCycle,
			pq.Array(supplier.SelectedDays), // Using pq.Array for array handling
			supplier.SortOrder,
		)
		if err != nil {
			return fmt.Errorf("error executing statement: %v", err)
		}
	}

	// Commit the transaction after all statements succeed
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}
	return nil
}
