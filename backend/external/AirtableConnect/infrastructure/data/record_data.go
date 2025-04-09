// backend/internal/AirtableConnect/infrastructure/data/record_data.go
package data

import (
	"backend/internal/AirtableConnect/domain/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// RecordRepository implements the RecordRepository interface
type RecordRepository struct {
	db *sql.DB
}

// NewRecordRepository creates a new instance of RecordRepository
func NewRecordRepository(db *sql.DB) *RecordRepository {
	return &RecordRepository{
		db: db,
	}
}

// SaveRecords saves records to the local database
// This generic implementation assumes tables have columns that match the record fields
func (r *RecordRepository) SaveRecords(tableName string, records []models.Record) error {
	// Start a transaction
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// For each record
	for _, record := range records {
		// Check if record exists
		var exists bool
		err := tx.QueryRow(
			fmt.Sprintf("SELECT EXISTS(SELECT 1 FROM %s WHERE airtable_id = $1)", tableName),
			record.ID,
		).Scan(&exists)
		if err != nil {
			return fmt.Errorf("error checking if record exists: %v", err)
		}

		// Convert record fields to JSON
		fieldsJSON, err := json.Marshal(record.Fields)
		if err != nil {
			return fmt.Errorf("error marshaling fields to JSON: %v", err)
		}

		if exists {
			// Update existing record
			_, err = tx.Exec(
				fmt.Sprintf("UPDATE %s SET fields = $1, updated_at = $2 WHERE airtable_id = $3", tableName),
				fieldsJSON,
				time.Now().UTC(),
				record.ID,
			)
		} else {
			// Insert new record
			_, err = tx.Exec(
				fmt.Sprintf("INSERT INTO %s (airtable_id, fields, created_at, updated_at) VALUES ($1, $2, $3, $4)", tableName),
				record.ID,
				fieldsJSON,
				record.CreatedTime,
				time.Now().UTC(),
			)
		}

		if err != nil {
			return fmt.Errorf("error saving record: %v", err)
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}

// GetRecords retrieves records from the local database
func (r *RecordRepository) GetRecords(tableName string, limit, offset int) ([]models.Record, error) {
	query := fmt.Sprintf(
		"SELECT airtable_id, fields, created_at FROM %s ORDER BY created_at DESC LIMIT $1 OFFSET $2",
		tableName,
	)
	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("error querying records: %v", err)
	}
	defer rows.Close()

	var records []models.Record
	for rows.Next() {
		var record models.Record
		var fieldsJSON []byte
		var createdAt time.Time

		err := rows.Scan(&record.ID, &fieldsJSON, &createdAt)
		if err != nil {
			return nil, fmt.Errorf("error scanning record: %v", err)
		}

		// Unmarshal fields from JSON
		var fields map[string]interface{}
		if err := json.Unmarshal(fieldsJSON, &fields); err != nil {
			return nil, fmt.Errorf("error unmarshaling fields: %v", err)
		}

		record.Fields = fields
		record.CreatedTime = createdAt
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %v", err)
	}

	return records, nil
}
