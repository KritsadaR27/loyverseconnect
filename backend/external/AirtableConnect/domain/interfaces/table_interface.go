// backend/external/AirtableConnect/domain/interfaces/table_interface.go
package interfaces

import "backend/external/AirtableConnect/domain/models"

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
