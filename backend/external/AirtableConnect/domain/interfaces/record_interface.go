// backend/external/AirtableConnect/domain/interfaces/record_interface.go
package interfaces

import "backend/external/AirtableConnect/domain/models"

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
