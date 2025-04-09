// backend/internal/AirtableConnect/infrastructure/external/airtable_client.go
package external

import (
	"backend/internal/AirtableConnect/domain/interfaces"
	"backend/internal/AirtableConnect/domain/models"
	"log"
	"time"

	"github.com/mehanizm/airtable"
)

// AirtableClientImpl implements the AirtableClient interface
type AirtableClientImpl struct {
	client *airtable.Client
}

// NewAirtableClient creates a new Airtable client implementation
func NewAirtableClient(client *airtable.Client) interfaces.AirtableClient {
	return &AirtableClientImpl{
		client: client,
	}
}

// GetRecords retrieves records from an Airtable table
func (c *AirtableClientImpl) GetRecords(baseID, tableName string) ([]models.Record, error) {
	table := c.client.GetTable(baseID, tableName)
	records, err := table.GetRecords().Do()
	if err != nil {
		log.Printf("Failed to get records from Airtable: %v", err)
		return nil, err
	}

	var result []models.Record
	for _, record := range records.Records {
		// Convert Airtable record to our model
		created, _ := time.Parse(time.RFC3339, record.CreatedTime)

		modelRecord := models.Record{
			ID:          record.ID,
			Fields:      record.Fields,
			CreatedTime: created,
		}
		result = append(result, modelRecord)
	}

	return result, nil
}

// CreateRecord creates a new record in an Airtable table
func (c *AirtableClientImpl) CreateRecord(baseID, tableName string, fields map[string]interface{}) (models.Record, error) {
	table := c.client.GetTable(baseID, tableName)
	record, err := table.CreateRecord(airtable.Record{
		Fields: fields,
	}).Do()
	if err != nil {
		log.Printf("Failed to create record in Airtable: %v", err)
		return models.Record{}, err
	}

	// Convert Airtable record to our model
	created, _ := time.Parse(time.RFC3339, record.CreatedTime)

	return models.Record{
		ID:          record.ID,
		Fields:      record.Fields,
		CreatedTime: created,
	}, nil
}

// UpdateRecord updates an existing record in an Airtable table
func (c *AirtableClientImpl) UpdateRecord(baseID, tableName, recordID string, fields map[string]interface{}) (models.Record, error) {
	table := c.client.GetTable(baseID, tableName)
	record, err := table.UpdateRecord(airtable.Record{
		ID:     recordID,
		Fields: fields,
	}).Do()
	if err != nil {
		log.Printf("Failed to update record in Airtable: %v", err)
		return models.Record{}, err
	}

	// Convert Airtable record to our model
	created, _ := time.Parse(time.RFC3339, record.CreatedTime)

	return models.Record{
		ID:          record.ID,
		Fields:      record.Fields,
		CreatedTime: created,
	}, nil
}

// DeleteRecord deletes a record from an Airtable table
func (c *AirtableClientImpl) DeleteRecord(baseID, tableName, recordID string) error {
	table := c.client.GetTable(baseID, tableName)
	_, err := table.DeleteRecord(recordID).Do()
	if err != nil {
		log.Printf("Failed to delete record from Airtable: %v", err)
		return err
	}
	return nil
}
