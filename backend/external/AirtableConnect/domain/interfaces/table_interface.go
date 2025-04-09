// backend/external/AirtableConnect/domain/interfaces/table_interface.go
package interfaces

import "backend/external/AirtableConnect/domain/models"

// TableRepository defines methods for working with table configurations
type TableRepository interface {
	SaveTable(table models.Table) (int, error)
	GetTableByID(id int) (models.Table, error)
	GetTableByName(name string) (models.Table, error)
	UpdateTable(table models.Table) error
	DeleteTable(id int) error
	ListTables() ([]models.Table, error)
	UpdateLastSyncTime(id int) error
}
