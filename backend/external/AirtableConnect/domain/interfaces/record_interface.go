// backend/internal/AirtableConnect/domain/interfaces/record_interface.go
package interfaces

import "backend/internal/AirtableConnect/domain/models"

// RecordRepository defines methods for working with records
type RecordRepository interface {
	// SaveRecords saves records to the local database
	SaveRecords(tableName string, records []models.Record) error
	
	// GetRecords retrieves records from the local database
	GetRecords(tableName string, limit, offset int) ([]models.Record, error)
	
	// GetRecordByID retrieves a specific record by ID
	GetRecordByID(tableName, recordID string) (models.Record, error)
	
	// GetRecordCount gets the count of records in a table
	GetRecordCount(tableName string) (int, error)
}

// backend/internal/AirtableConnect/domain/interfaces/table_interface.go
package interfaces

import "backend/internal/AirtableConnect/domain/models"

// TableRepository defines methods for working with table configurations
type TableRepository interface {
	// SaveTable saves a new table configuration
	SaveTable(table models.Table) (int, error)
	
	// GetTableByID retrieves a table configuration by ID
	GetTableByID(id int) (models.Table, error)
	
	// GetTableByName retrieves a table configuration by name
	GetTableByName(name string) (models.Table, error)
	
	// UpdateTable updates an existing table configuration
	UpdateTable(table models.Table) error
	
	// DeleteTable removes a table configuration
	DeleteTable(id int) error
	
	// ListTables retrieves all table configurations
	ListTables() ([]models.Table, error)
	
	// UpdateLastSyncTime updates the last sync time for a table
	UpdateLastSyncTime(id int) error
}

