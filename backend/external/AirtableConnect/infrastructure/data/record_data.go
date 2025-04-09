// backend/external/AirtableConnect/infrastructure/data/record_data.go
package data

import (
	"backend/external/AirtableConnect/domain/models"
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
func (r *RecordRepository) GetRecordByID(tableName, recordID string) (models.Record, error) {
	query := fmt.Sprintf(
		"SELECT airtable_id, fields, created_at FROM %s WHERE airtable_id = $1",
		tableName,
	)

	var record models.Record
	var fieldsJSON []byte
	var createdAt time.Time

	err := r.db.QueryRow(query, recordID).Scan(&record.ID, &fieldsJSON, &createdAt)
	if err != nil {
		return models.Record{}, fmt.Errorf("error retrieving record: %v", err)
	}

	// Unmarshal fields from JSON
	var fields map[string]interface{}
	if err := json.Unmarshal(fieldsJSON, &fields); err != nil {
		return models.Record{}, fmt.Errorf("error unmarshaling fields: %v", err)
	}

	record.Fields = fields
	record.CreatedTime = createdAt

	return record, nil
}

func (r *RecordRepository) GetRecordCount(tableName string) (int, error) {
	query := fmt.Sprintf("SELECT COUNT(*) FROM %s", tableName)

	var count int
	err := r.db.QueryRow(query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("error counting records: %v", err)
	}

	return count, nil
}

type TableRepository struct {
	db *sql.DB
}

func NewTableRepository(db *sql.DB) *TableRepository {
	return &TableRepository{db: db}
}
