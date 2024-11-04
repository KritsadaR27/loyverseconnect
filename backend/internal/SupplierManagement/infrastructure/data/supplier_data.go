// infrastructure/repositories/supplier_repository.go
package data

import (
	"backend/internal/SupplierManagement/domain/models"
	"database/sql"
	"fmt"
)

type SupplierRepository struct {
	db *sql.DB
}

func NewSupplierRepository(db *sql.DB) *SupplierRepository {
	return &SupplierRepository{db: db}
}

func (repo *SupplierRepository) GetSuppliers() ([]models.Supplier, error) {
	var suppliers []models.Supplier

	rows, err := repo.db.Query(`SELECT supplier_id, supplier_name, order_cycle, selected_days, sort_order FROM loysuppliers`)
	if err != nil {
		return nil, fmt.Errorf("error querying suppliers: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var supplier models.Supplier
		if err := rows.Scan(&supplier.SupplierID, &supplier.SupplierName, &supplier.OrderCycle, &supplier.SelectedDays, &supplier.SortOrder); err != nil {
			return nil, fmt.Errorf("error scanning supplier row: %v", err)
		}
		suppliers = append(suppliers, supplier)
	}

	return suppliers, nil
}

func (repo *SupplierRepository) SaveSupplierSettings(suppliers []models.Supplier) error {
	tx, err := repo.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
        UPDATE loysuppliers
        SET supplier_name = $1, order_cycle = $2, selected_days = $3, sort_order = $4
        WHERE supplier_id = $5
    `)
	if err != nil {
		return fmt.Errorf("error preparing statement: %v", err)
	}
	defer stmt.Close()

	for _, supplier := range suppliers {
		_, err := stmt.Exec(supplier.SupplierName, supplier.OrderCycle.String, supplier.SelectedDays.String, supplier.SortOrder, supplier.SupplierID)
		if err != nil {
			return fmt.Errorf("error executing statement: %v", err)
		}
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}
	return nil
}

// FetchSupplierCycles fetches supplier cycles from the database
func (repo *SupplierRepository) FetchSupplierCycles() ([]models.Supplier, error) {
	rows, err := repo.db.Query("SELECT supplier_id, supplier_name, order_cycle, selected_days FROM loysuppliers")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var suppliers []models.Supplier
	for rows.Next() {
		var supplier models.Supplier
		if err := rows.Scan(&supplier.SupplierID, &supplier.SupplierName, &supplier.OrderCycle, &supplier.SelectedDays); err != nil {
			return nil, fmt.Errorf("error scanning supplier row: %v", err)
		}
		suppliers = append(suppliers, supplier)
	}

	return suppliers, nil
}

// Implement the other methods of the interface as well...
