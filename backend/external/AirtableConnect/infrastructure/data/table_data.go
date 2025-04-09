// backend/external/AirtableConnect/infrastructure/data/table_data.go
package data

import (
	"backend/external/AirtableConnect/domain/models"
	"database/sql"
	"fmt"
	"time"
)

// TableRepository implements the TableRepository interface
type TableRepository struct {
	db *sql.DB
}

// NewTableRepository creates a new instance of TableRepository
func NewTableRepository(db *sql.DB) *TableRepository {
	return &TableRepository{
		db: db,
	}
}

// SaveTable saves a new table configuration
func (r *TableRepository) SaveTable(table models.Table) (int, error) {
	query := `
		INSERT INTO airtable_tables (
			name, 
			airtable_id, 
			description, 
			mapping, 
			create_sql, 
			source_sql, 
			sync_interval, 
			sync_direction, 
			last_sync_time, 
			active
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id
	`
	var id int
	err := r.db.QueryRow(
		query,
		table.Name,
		table.AirtableID,
		table.Description,
		table.Mapping,
		table.CreateSQL,
		table.SourceSQL,
		table.SyncInterval,
		table.SyncDirection,
		table.LastSyncTime,
		table.Active,
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("error saving table configuration: %v", err)
	}

	return id, nil
}

// GetTableByID retrieves a table configuration by ID
func (r *TableRepository) GetTableByID(id int) (models.Table, error) {
	query := `
		SELECT 
			id, 
			name, 
			airtable_id, 
			description, 
			mapping, 
			create_sql, 
			source_sql, 
			sync_interval, 
			sync_direction, 
			last_sync_time, 
			active
		FROM airtable_tables
		WHERE id = $1
	`
	var table models.Table
	err := r.db.QueryRow(query, id).Scan(
		&table.ID,
		&table.Name,
		&table.AirtableID,
		&table.Description,
		&table.Mapping,
		&table.CreateSQL,
		&table.SourceSQL,
		&table.SyncInterval,
		&table.SyncDirection,
		&table.LastSyncTime,
		&table.Active,
	)

	if err != nil {
		return models.Table{}, fmt.Errorf("error retrieving table configuration: %v", err)
	}

	return table, nil
}

// GetTableByName retrieves a table configuration by name
func (r *TableRepository) GetTableByName(name string) (models.Table, error) {
	query := `
		SELECT 
			id, 
			name, 
			airtable_id, 
			description, 
			mapping, 
			create_sql, 
			source_sql, 
			sync_interval, 
			sync_direction, 
			last_sync_time, 
			active
		FROM airtable_tables
		WHERE name = $1
	`
	var table models.Table
	err := r.db.QueryRow(query, name).Scan(
		&table.ID,
		&table.Name,
		&table.AirtableID,
		&table.Description,
		&table.Mapping,
		&table.CreateSQL,
		&table.SourceSQL,
		&table.SyncInterval,
		&table.SyncDirection,
		&table.LastSyncTime,
		&table.Active,
	)

	if err != nil {
		return models.Table{}, fmt.Errorf("error retrieving table configuration: %v", err)
	}

	return table, nil
}

// UpdateTable updates an existing table configuration
func (r *TableRepository) UpdateTable(table models.Table) error {
	query := `
		UPDATE airtable_tables
		SET 
			name = $1, 
			airtable_id = $2, 
			description = $3, 
			mapping = $4, 
			create_sql = $5, 
			source_sql = $6, 
			sync_interval = $7, 
			sync_direction = $8, 
			active = $9
		WHERE id = $10
	`
	_, err := r.db.Exec(
		query,
		table.Name,
		table.AirtableID,
		table.Description,
		table.Mapping,
		table.CreateSQL,
		table.SourceSQL,
		table.SyncInterval,
		table.SyncDirection,
		table.Active,
		table.ID,
	)

	if err != nil {
		return fmt.Errorf("error updating table configuration: %v", err)
	}

	return nil
}

// DeleteTable removes a table configuration
func (r *TableRepository) DeleteTable(id int) error {
	query := `
		DELETE FROM airtable_tables
		WHERE id = $1
	`
	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error deleting table configuration: %v", err)
	}

	return nil
}

// ListTables retrieves all table configurations
func (r *TableRepository) ListTables() ([]models.Table, error) {
	query := `
		SELECT 
			id, 
			name, 
			airtable_id, 
			description, 
			mapping, 
			create_sql, 
			source_sql, 
			sync_interval, 
			sync_direction, 
			last_sync_time, 
			active
		FROM airtable_tables
		ORDER BY name
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error listing table configurations: %v", err)
	}
	defer rows.Close()

	var tables []models.Table
	for rows.Next() {
		var table models.Table
		err := rows.Scan(
			&table.ID,
			&table.Name,
			&table.AirtableID,
			&table.Description,
			&table.Mapping,
			&table.CreateSQL,
			&table.SourceSQL,
			&table.SyncInterval,
			&table.SyncDirection,
			&table.LastSyncTime,
			&table.Active,
		)

		if err != nil {
			return nil, fmt.Errorf("error scanning table row: %v", err)
		}

		tables = append(tables, table)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating table rows: %v", err)
	}

	return tables, nil
}

// UpdateLastSyncTime updates the last sync time for a table
func (r *TableRepository) UpdateLastSyncTime(id int) error {
	query := `
		UPDATE airtable_tables
		SET last_sync_time = $1
		WHERE id = $2
	`
	_, err := r.db.Exec(query, time.Now().UTC(), id)
	if err != nil {
		return fmt.Errorf("error updating last sync time: %v", err)
	}

	return nil
}

// SaveSyncResult saves a sync result to the history table
func (r *TableRepository) SaveSyncResult(result models.SyncResult, tableID int) error {
	query := `
		INSERT INTO airtable_sync_history (
			table_id,
			direction,
			records_sync,
			records_error,
			start_time,
			end_time,
			error_messages
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	// Convert error messages slice to a JSON array string
	var errorMessagesJSON string
	if len(result.ErrorMessages) > 0 {
		errorMessagesJSON = "["
		for i, msg := range result.ErrorMessages {
			if i > 0 {
				errorMessagesJSON += ","
			}
			errorMessagesJSON += "\"" + msg + "\""
		}
		errorMessagesJSON += "]"
	} else {
		errorMessagesJSON = "[]"
	}

	_, err := r.db.Exec(
		query,
		tableID,
		result.Direction,
		result.RecordsSync,
		result.RecordsError,
		result.StartTime,
		result.EndTime,
		errorMessagesJSON,
	)

	if err != nil {
		return fmt.Errorf("error saving sync result: %v", err)
	}

	return nil
}
