
// backend/external/AirtableConnect/domain/models/table.go
package models

import "time"

// Table represents an Airtable table configuration
type Table struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	AirtableID    string    `json:"airtable_id"`
	Description   string    `json:"description"`
	Mapping       string    `json:"mapping"` // JSON string of field mappings
	LastSyncTime  time.Time `json:"last_sync_time"`
	CreateSQL     string    `json:"create_sql,omitempty"` // SQL to create local table
	SourceSQL     string    `json:"source_sql,omitempty"` // SQL to retrieve local data
	SyncInterval  int       `json:"sync_interval"`        // Minutes between syncs
	SyncDirection string    `json:"sync_direction"`       // "push", "pull", or "both"
	Active        bool      `json:"active"`
}

// TableRequest is the model for table creation/update requests
type TableRequest struct {
	Name          string `json:"name"`
	AirtableID    string `json:"airtable_id"`
	Description   string `json:"description"`
	Mapping       string `json:"mapping"`
	CreateSQL     string `json:"create_sql,omitempty"`
	SourceSQL     string `json:"source_sql,omitem