// backend/external/AirtableConnect/infrastructure/external/airtable_client.go
package external

import (
	"backend/external/AirtableConnect/domain/interfaces"
	"backend/external/AirtableConnect/domain/models"
	"fmt"
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

// GetRecordsFromView retrieves records from a specific view in an Airtable table
func (c *AirtableClientImpl) GetRecordsFromView(baseID, tableName, viewName string) ([]models.Record, error) {
	table := c.client.GetTable(baseID, tableName)

	// ดึงข้อมูลจาก View โดยใช้ query parameters
	records, err := table.GetRecords().FromView(viewName).Do()
	if err != nil {
		log.Printf("Failed to get records from Airtable view %s: %v", viewName, err)
		return nil, err
	}

	var result []models.Record
	for _, record := range records.Records {
		// Convert Airtable record to our model
		created, _ := time.Parse(time.RFC3339, record.CreatedTime)

		// แปลงชื่อฟิลด์ภาษาไทยเป็นภาษาอังกฤษ
		normalizedFields := models.NormalizeFields(record.Fields)

		modelRecord := models.Record{
			ID:          record.ID,
			Fields:      normalizedFields,
			CreatedTime: created,
		}
		result = append(result, modelRecord)
	}

	return result, nil
}

// GetRecords retrieves records from an Airtable table
func (c *AirtableClientImpl) GetRecords(baseID, tableName string) ([]models.Record, error) {
	table := c.client.GetTable(baseID, tableName)

	records, err := table.GetRecords().Do() // ไม่มี .FromView
	if err != nil {
		log.Printf("Failed to get records from Airtable: %v", err)
		return nil, err
	}

	var result []models.Record
	for _, record := range records.Records {
		created, _ := time.Parse(time.RFC3339, record.CreatedTime)
		result = append(result, models.Record{
			ID:          record.ID,
			Fields:      models.NormalizeFields(record.Fields),
			CreatedTime: created,
		})
	}
	return result, nil
}

// CreateRecord creates a new record in an Airtable table
func (c *AirtableClientImpl) CreateRecord(baseID, tableName string, fields map[string]interface{}) (models.Record, error) {
	table := c.client.GetTable(baseID, tableName)

	recordsToSend := &airtable.Records{
		Records: []*airtable.Record{
			{
				Fields: fields,
			},
		},
	}

	createdRecords, err := table.AddRecords(recordsToSend)
	if err != nil {
		log.Printf("Error in CreateRecord: %v, Fields: %v", err, fields)
		return models.Record{}, err
	}

	if len(createdRecords.Records) == 0 {
		return models.Record{}, fmt.Errorf("no records created")
	}

	createdRecord := createdRecords.Records[0]
	createdTime, _ := time.Parse(time.RFC3339, createdRecord.CreatedTime)

	return models.Record{
		ID:          createdRecord.ID,
		Fields:      createdRecord.Fields,
		CreatedTime: createdTime,
	}, nil
}

// UpdateRecord updates an existing record in an Airtable table
func (c *AirtableClientImpl) UpdateRecord(baseID, tableName, recordID string, fields map[string]interface{}) (models.Record, error) {
	table := c.client.GetTable(baseID, tableName)

	toUpdate := &airtable.Records{
		Records: []*airtable.Record{
			{
				ID:     recordID,
				Fields: fields,
			},
		},
	}

	updated, err := table.UpdateRecords(toUpdate)
	if err != nil || len(updated.Records) == 0 {
		log.Printf("Failed to update record in Airtable: %v", err)
		return models.Record{}, err
	}

	createdTime, _ := time.Parse(time.RFC3339, updated.Records[0].CreatedTime)

	return models.Record{
		ID:          updated.Records[0].ID,
		Fields:      updated.Records[0].Fields,
		CreatedTime: createdTime,
	}, nil
}

// DeleteRecord deletes a record from an Airtable table
func (c *AirtableClientImpl) DeleteRecord(baseID, tableName, recordID string) error {
	table := c.client.GetTable(baseID, tableName)

	_, err := table.DeleteRecords([]string{recordID})
	if err != nil {
		log.Printf("Failed to delete record from Airtable: %v", err)
	}
	return err
}

// func exampleUsage() {
// 	fields := map[string]interface{}{
// 		"Name":  "John Doe",
// 		"Email": "john.doe@example.com",
// 	}
// 	// Example usage of fields (e.g., calling CreateRecord)
// 	// _ = fields
// }
