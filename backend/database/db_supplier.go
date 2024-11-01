package database

import (
	"backend/models"
	"database/sql"
	"fmt"
	"log"
	"strings"
)

// ฟังก์ชันสำหรับดึงข้อมูลซัพพลายเออร์
func GetSuppliers(db *sql.DB) ([]models.LoySupplier, error) {
	var suppliers []models.LoySupplier

	rows, err := db.Query(`SELECT supplier_id, supplier_name, order_cycle, selected_days, sort_order FROM loysuppliers`)
	if err != nil {
		return nil, fmt.Errorf("error querying suppliers: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var supplier models.LoySupplier
		if err := rows.Scan(&supplier.SupplierID, &supplier.SupplierName, &supplier.OrderCycle, &supplier.SelectedDays, &supplier.SortOrder); err != nil {
			return nil, fmt.Errorf("error scanning supplier row: %v", err)
		}
		suppliers = append(suppliers, supplier)
	}

	return suppliers, nil
}

func SaveSupplierSettings(db *sql.DB, suppliers []models.LoySupplier) error {
	tx, err := db.Begin()
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
		log.Printf("Updating supplier: %+v\n", supplier)

		orderCycle := supplier.OrderCycle.String
		selectedDays := supplier.SelectedDays.String

		if !supplier.OrderCycle.Valid {
			orderCycle = ""
		}
		if !supplier.SelectedDays.Valid {
			selectedDays = ""
		}

		_, err := stmt.Exec(supplier.SupplierName, orderCycle, selectedDays, supplier.SortOrder, supplier.SupplierID)
		if err != nil {
			log.Printf("Error executing statement for supplier %s: %v", supplier.SupplierID, err)
			return fmt.Errorf("error executing statement: %v", err)
		}
	}

	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v", err)
		return fmt.Errorf("error committing transaction: %v", err)
	}
	log.Println("Transaction committed successfully")
	return nil
}

// ฟังก์ชันสำหรับอัพเดต order cycle และ selected days
func UpdateOrderCycle(db *sql.DB, supplierID string, orderCycle string, selectedDays []string) error {
	days := sql.NullString{
		String: strings.Join(selectedDays, ","),
		Valid:  len(selectedDays) > 0,
	}

	query := `
        UPDATE loysuppliers
        SET order_cycle = $1, selected_days = $2
        WHERE supplier_id = $3
    `
	_, err := db.Exec(query, orderCycle, days, supplierID)
	if err != nil {
		return fmt.Errorf("failed to update order cycle: %w", err)
	}
	return nil
}

// ฟังก์ชันสำหรับดึงข้อมูล order cycle และ selected days
func GetOrderCycle(db *sql.DB, supplierID string) (string, []string, error) {
	var orderCycle sql.NullString
	var selectedDays sql.NullString

	query := `
        SELECT order_cycle, selected_days FROM loysuppliers WHERE supplier_id = $1
    `
	err := db.QueryRow(query, supplierID).Scan(&orderCycle, &selectedDays)
	if err != nil {
		return "", nil, fmt.Errorf("failed to get order cycle: %w", err)
	}

	var days []string
	if selectedDays.Valid {
		days = strings.Split(selectedDays.String, ",")
	}

	return orderCycle.String, days, nil
}

// FetchSupplierCycles fetches supplier cycles from the database
func FetchSupplierCycles(db *sql.DB) ([]models.LoySupplier, error) {
	rows, err := db.Query("SELECT supplier_id, supplier_name, order_cycle, selected_days FROM loysuppliers")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var suppliers []models.LoySupplier
	for rows.Next() {
		var supplier models.LoySupplier
		var selectedDays sql.NullString

		if err := rows.Scan(&supplier.SupplierID, &supplier.SupplierName, &supplier.OrderCycle, &selectedDays); err != nil {
			return nil, err
		}

		// Convert selectedDays to []string if it is not NULL or empty
		if selectedDays.Valid && selectedDays.String != "" {
			supplier.SelectedDays = sql.NullString{
				Valid:  true,
				String: strings.Join(strings.Split(selectedDays.String, ","), ","),
			}
		} else {
			supplier.SelectedDays = sql.NullString{Valid: false, String: ""}
		}

		suppliers = append(suppliers, supplier)
	}
	return suppliers, nil
}

// Helper function to convert sql.NullString to []string
func getSelectedDaysAsArray(selectedDays sql.NullString) []string {
	if selectedDays.Valid && selectedDays.String != "" {
		return strings.Split(selectedDays.String, ",")
	}
	return []string{} // Return an empty slice if NULL or empty
}
