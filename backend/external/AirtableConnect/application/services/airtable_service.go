// backend/internal/AirtableConnect/application/services/airtable_service.go
package services

import (
	"backend/internal/AirtableConnect/domain/interfaces"
	"backend/internal/AirtableConnect/domain/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

// AirtableService handles synchronization with Airtable
type AirtableService struct {
	tableRepo      interfaces.TableRepository
	recordRepo     interfaces.RecordRepository
	airtableClient interfaces.AirtableClient
	baseID         string
	db             *sql.DB
}

// NewAirtableService creates a new instance of AirtableService
func NewAirtableService(
	tableRepo interfaces.TableRepository,
	recordRepo interfaces.RecordRepository,
	airtableClient interfaces.AirtableClient,
	baseID string,
	db *sql.DB,
) *AirtableService {
	return &AirtableService{
		tableRepo:      tableRepo,
		recordRepo:     recordRepo,
		airtableClient: airtableClient,
		baseID:         baseID,
		db:             db,
	}
}

// GetTables retrieves all configured tables
func (s *AirtableService) GetTables() ([]models.Table, error) {
	return s.tableRepo.ListTables()
}

// GetTableByID retrieves a table configuration by ID
func (s *AirtableService) GetTableByID(id int) (models.Table, error) {
	return s.tableRepo.GetTableByID(id)
}

// CreateTable creates a new table configuration
func (s *AirtableService) CreateTable(req models.TableRequest) (models.Table, error) {
	// Validate mapping JSON
	var mapping map[string]string
	if err := json.Unmarshal([]byte(req.Mapping), &mapping); err != nil {
		return models.Table{}, fmt.Errorf("invalid mapping JSON: %v", err)
	}

	table := models.Table{
		Name:          req.Name,
		AirtableID:    req.AirtableID,
		Description:   req.Description,
		Mapping:       req.Mapping,
		CreateSQL:     req.CreateSQL,
		SourceSQL:     req.SourceSQL,
		SyncInterval:  req.SyncInterval,
		SyncDirection: req.SyncDirection,
		Active:        true,
		LastSyncTime:  time.Now().UTC(),
	}

	// If CreateSQL is provided, create the local table
	if table.CreateSQL != "" {
		if _, err := s.db.Exec(table.CreateSQL); err != nil {
			return models.Table{}, fmt.Errorf("error creating local table: %v", err)
		}
	}

	// Save table configuration
	id, err := s.tableRepo.SaveTable(table)
	if err != nil {
		return models.Table{}, err
	}
	table.ID = id

	return table, nil
}

// UpdateTable updates an existing table configuration
func (s *AirtableService) UpdateTable(id int, req models.TableRequest) (models.Table, error) {
	// Retrieve existing table
	table, err := s.tableRepo.GetTableByID(id)
	if err != nil {
		return models.Table{}, err
	}

	// Validate mapping JSON
	var mapping map[string]string
	if err := json.Unmarshal([]byte(req.Mapping), &mapping); err != nil {
		return models.Table{}, fmt.Errorf("invalid mapping JSON: %v", err)
	}

	// Update fields
	table.Name = req.Name
	table.AirtableID = req.AirtableID
	table.Description = req.Description
	table.Mapping = req.Mapping
	table.SyncInterval = req.SyncInterval
	table.SyncDirection = req.SyncDirection

	// Only update SQL if provided
	if req.CreateSQL != "" {
		table.CreateSQL = req.CreateSQL
	}
	if req.SourceSQL != "" {
		table.SourceSQL = req.SourceSQL
	}

	// Save updated table
	if err := s.tableRepo.UpdateTable(table); err != nil {
		return models.Table{}, err
	}

	return table, nil
}

// DeleteTable removes a table configuration
func (s *AirtableService) DeleteTable(id int) error {
	return s.tableRepo.DeleteTable(id)
}

// SyncTable synchronizes data between the local database and Airtable
func (s *AirtableService) SyncTable(tableID int) (models.SyncResult, error) {
	// Get table configuration
	table, err := s.tableRepo.GetTableByID(tableID)
	if err != nil {
		return models.SyncResult{}, err
	}

	if !table.Active {
		return models.SyncResult{}, fmt.Errorf("table is not active")
	}

	result := models.SyncResult{
		TableName: table.Name,
		Direction: table.SyncDirection,
		StartTime: time.Now().UTC(),
	}

	var errors []string

	// Perform sync based on direction
	switch table.SyncDirection {
	case "pull":
		syncedCount, errs := s.pullFromAirtable(table)
		result.RecordsSync = syncedCount
		errors = append(errors, errs...)
	case "push":
		syncedCount, errs := s.pushToAirtable(table)
		result.RecordsSync = syncedCount
		errors = append(errors, errs...)
	case "both":
		// First pull, then push
		pullCount, pullErrs := s.pullFromAirtable(table)
		pushCount, pushErrs := s.pushToAirtable(table)
		result.RecordsSync = pullCount + pushCount
		errors = append(errors, pullErrs...)
		errors = append(errors, pushErrs...)
	default:
		return result, fmt.Errorf("invalid sync direction: %s", table.SyncDirection)
	}

	result.ErrorMessages = errors
	result.RecordsError = len(errors)
	result.EndTime = time.Now().UTC()

	// Update last sync time
	if err := s.tableRepo.UpdateLastSyncTime(tableID); err != nil {
		log.Printf("Error updating last sync time: %v", err)
	}

	return result, nil
}

// pullFromAirtable pulls data from Airtable to the local database
func (s *AirtableService) pullFromAirtable(table models.Table) (int, []string) {
	var errors []string
	syncedCount := 0

	// Get records from Airtable
	records, err := s.airtableClient.GetRecords(s.baseID, table.AirtableID)
	if err != nil {
		errors = append(errors, fmt.Sprintf("Error fetching records from Airtable: %v", err))
		return syncedCount, errors
	}

	// Save records to local database
	if err := s.recordRepo.SaveRecords(table.Name, records); err != nil {
		errors = append(errors, fmt.Sprintf("Error saving records to local database: %v", err))
		return syncedCount, errors
	}

	syncedCount = len(records)
	return syncedCount, errors
}

// pushToAirtable pushes data from the local database to Airtable
func (s *AirtableService) pushToAirtable(table models.Table) (int, []string) {
	var errors []string
	syncedCount := 0

	// Get records from local database
	records, err := s.recordRepo.GetRecords(table.Name, 1000, 0)
	if err != nil {
		errors = append(errors, fmt.Sprintf("Error fetching records from local database: %v", err))
		return syncedCount, errors
	}

	// Parse field mapping
	var mapping map[string]string
	if err := json.Unmarshal([]byte(table.Mapping), &mapping); err != nil {
		errors = append(errors, fmt.Sprintf("Error parsing mapping: %v", err))
		return syncedCount, errors
	}

	// Push records to Airtable
	for _, record := range records {
		// Map fields according to configured mapping
		mappedFields := make(map[string]interface{})
		for localField, airtableField := range mapping {
			if value, ok := record.Fields[localField]; ok {
				mappedFields[airtableField] = value
			}
		}

		// Check if record exists in Airtable (has ID)
		if record.ID != "" {
			// Update existing record
			_, err := s.airtableClient.UpdateRecord(s.baseID, table.AirtableID, record.ID, mappedFields)
			if err != nil {
				errors = append(errors, fmt.Sprintf("Error updating record %s: %v", record.ID, err))
				continue
			}
		} else {
			// Create new record
			_, err := s.airtableClient.CreateRecord(s.baseID, table.AirtableID, mappedFields)
			if err != nil {
				errors = append(errors, fmt.Sprintf("Error creating record: %v", err))
				continue
			}
		}

		syncedCount++
	}

	return syncedCount, errors
}

// SyncAllTables synchronizes all active tables
func (s *AirtableService) SyncAllTables() ([]models.SyncResult, error) {
	tables, err := s.tableRepo.ListTables()
	if err != nil {
		return nil, err
	}

	var results []models.SyncResult
	for _, table := range tables {
		if table.Active {
			result, err := s.SyncTable(table.ID)
			if err != nil {
				log.Printf("Error syncing table %s: %v", table.Name, err)
				result.ErrorMessages = append(result.ErrorMessages, err.Error())
			}
			results = append(results, result)
		}
	}

	return results, nil
}
