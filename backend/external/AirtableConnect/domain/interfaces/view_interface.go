// backend/external/AirtableConnect/domain/interfaces/view_interface.go
package interfaces

import "backend/external/AirtableConnect/domain/models"

type ViewRepository interface {
	GetViewsByTableID(tableID string) ([]models.View, error)
}
