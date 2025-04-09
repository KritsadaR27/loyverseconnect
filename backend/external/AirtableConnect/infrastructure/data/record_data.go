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

// GetRecordByID retrieves a specific record by ID
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

// GetRecordCount gets the count of records in a table
func (r *RecordRepository) GetRecordCount(tableName string) (int, error) {
	query := fmt.Sprintf("SELECT COUNT(*) FROM %s", tableName)

	var count int
	err := r.db.QueryRow(query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("error counting records: %v", err)
	}

	return count, nil
}

// ExecuteSourceSQL executes a custom SQL query and returns the records
func (r *RecordRepository) ExecuteSourceSQL(sourceSQL string) ([]map[string]interface{}, error) {
	// Execute the source SQL
	rows, err := r.db.Query(sourceSQL)
	if err != nil {
		return nil, fmt.Errorf("error executing source SQL: %v", err)
	}
	defer rows.Close()

	// Get column names
	columns, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("error getting column names: %v", err)
	}

	// Prepare result set
	var results []map[string]interface{}

	// For each row
	for rows.Next() {
		// Create a slice of interface{} to hold the values
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))

		// Initialize interfaces to hold scan results
		for i := range columns {
			valuePtrs[i] = &values[i]
		}

		// Scan the row into the interfaces
		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("error scanning row: %v", err)
		}

		// Create a map to hold the row data
		row := make(map[string]interface{})

		// For each column
		for i, colName := range columns {
			// Get the value
			val := values[i]

			// Convert any specific types as needed
			switch v := val.(type) {
			case []byte:
				// Try to unmarshal as JSON if it's a JSONB field
				var jsonData interface{}
				if err := json.Unmarshal(v, &jsonData); err == nil {
					row[colName] = jsonData
				} else {
					// Otherwise treat as string
					row[colName] = string(v)
				}
			case time.Time:
				// Format time as RFC3339 string
				row[colName] = v.Format(time.RFC3339)
			default:
				// Use value as is
				row[colName] = v
			}
		}

		// Add the row to the results
		results = append(results, row)
	}

	// Check for any errors in iteration
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %v", err)
	}

	return results, nil
}

// ExecuteCustomSQL executes a custom SQL statement (for CREATE TABLE, etc.)
func (r *RecordRepository) ExecuteCustomSQL(sql string) error {
	_, err := r.db.Exec(sql)
	if err != nil {
		return fmt.Errorf("error executing custom SQL: %v", err)
	}
	return nil
}

// CheckTableExists checks if a table exists in the database
func (r *RecordRepository) CheckTableExists(tableName string) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = $1
		)
	`
	var exists bool
	err := r.db.QueryRow(query, tableName).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("error checking if table exists: %v", err)
	}
	return exists, nil
}
