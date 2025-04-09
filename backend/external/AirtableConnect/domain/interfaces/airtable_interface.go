// backend/external/AirtableConnect/domain/interfaces/airtable_interface.go
package interfaces

import "backend/external/AirtableConnect/domain/models"

// AirtableClient defines methods for interacting with the Airtable API
type AirtableClient interface {
	// GetRecords retrieves records from an Airtable table
	GetRecords(baseID, tableName string) ([]models.Record, error)

	// CreateRecord creates a new record in an Airtable table
	CreateRecord(baseID, tableName string, fields map[string]interface{}) (models.Record, error)

	// UpdateRecord updates an existing record in an Airtable table
	UpdateRecord(baseID, tableName, recordID string, fields map[string]interface{}) (models.Record, error)

	// DeleteRecord deletes a record from an Airtable table
	DeleteRecord(baseID, tableName, recordID string) error
}
