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
func (repo *SupplierRepository) SaveCustomSupplierFields(supplierFields []models.CustomSupplierField) error {
	tx, err := repo.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
        INSERT INTO custom_supplier_fields (supplier_id, order_cycle, selected_days, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (supplier_id) 
        DO UPDATE SET order_cycle = EXCLUDED.order_cycle,
                      selected_days = EXCLUDED.selected_days,
                      sort_order = EXCLUDED.sort_order
    `)
	if err != nil {
		return fmt.Errorf("error preparing statement: %v", err)
	}
	defer stmt.Close()

	for _, supplier := range supplierFields {
		// ถ้า order_cycle เป็นค่าว่าง, ให้ตั้งเป็น NULL
		if supplier.OrderCycle == "" {
			supplier.OrderCycle = "" // ใช้ string ธรรมดา
		}

		// ถ้า sort_order เป็น 0, ให้ตั้งเป็น NULL
		if supplier.SortOrder == 0 {
			supplier.SortOrder = 0 // ใช้ 0 แทนค่าที่ว่าง
		}

		// ถ้า selected_days เป็น array ว่าง, ให้ตั้งเป็น NULL
		if len(supplier.SelectedDays) == 0 {
			supplier.SelectedDays = nil // ตั้งเป็น NULL ถ้าไม่มีวัน
		}

		// ทำการ Execute statement เพื่อบันทึกข้อมูลในฐานข้อมูล
		_, err := stmt.Exec(
			supplier.SupplierID,             // supplier_id
			supplier.OrderCycle,             // order_cycle (string)
			pq.Array(supplier.SelectedDays), // ใช้ pq.Array สำหรับ array
			supplier.SortOrder,              // sort_order (int)
		)
		if err != nil {
			return fmt.Errorf("error executing statement: %v", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}
