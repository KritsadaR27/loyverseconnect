// backend/external/LineConnect/domain/interfaces/group_interface.go
package interfaces

import "backend/external/LineConnect/domain/models"

// GroupRepository defines the methods for accessing group data
type GroupRepository interface {
	// SaveGroup saves a new group to the database
	SaveGroup(group models.Group) error

	// GetGroupByID retrieves a group by its ID
	GetGroupByID(id string) (models.Group, error)

	// UpdateGroup updates an existing group
	UpdateGroup(group models.Group) error

	// DeleteGroup removes a group from the database
	DeleteGroup(id string) error

	// ListGroups retrieves all groups
	ListGroups() ([]models.Group, error)
}
