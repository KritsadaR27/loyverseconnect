// backend/external/AirtableConnect/domain/models/record.go
package models

import "time"

// Record represents a generic Airtable record
type Record struct {
	ID          string                 `json:"id"`
	Fields      map[string]interface{} `json:"fields"`
	CreatedTime time.Time              `json:"created_time"`
}

// SyncRequest represents a request to sync data with Airtable
type SyncRequest struct {
	TableName string `json:"table_name"`
	Direction string `json:"direction"` // "push", "pull", or "both"
}

// SyncResult represents the result of a sync operation
type SyncResult struct {
	TableName     string    `json:"table_name"`
	Direction     string    `json:"direction"`
	RecordsSync   int       `json:"records_sync"`
	RecordsError  int       `json:"records_error"`
	StartTime     time.Time `json:"start_time"`
	EndTime       time.Time `json:"end_time"`
	ErrorMessages []string  `json:"error_messages,omitempty"`
}
