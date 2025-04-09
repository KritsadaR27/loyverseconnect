// backend/external/AirtableConnect/domain/interfaces/record_interface.go
package interfaces

import "backend/external/AirtableConnect/domain/models"

// RecordRepository defines methods for working with records
type RecordRepository interface {
	SaveRecords(tableName string, records []models.Record) error
	GetRecords(tableName string, limit, offset int) ([]models.Record, error)
	GetRecordByID(tableName, recordID string) (models.Record, error)
	GetRecordCount(tableName string) (int, error)
}
