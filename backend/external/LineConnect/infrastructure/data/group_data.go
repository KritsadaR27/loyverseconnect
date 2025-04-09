// backend/external/LineConnect/infrastructure/data/group_data.go
package data

import (
	"backend/external/LineConnect/domain/models"
	"database/sql"
	"fmt"
	"time"
)

// GroupRepository implements the GroupRepository interface
type GroupRepository struct {
	db *sql.DB
}

// NewGroupRepository creates a new instance of GroupRepository
func NewGroupRepository(db *sql.DB) *GroupRepository {
	return &GroupRepository{
		db: db,
	}
}

// SaveGroup saves a new group to the database
func (r *GroupRepository) SaveGroup(group models.Group) error {
	query := `
		INSERT INTO line_groups (id, name, description, created_at, updated_at, active)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (id) DO UPDATE
		SET name = $2, description = $3, updated_at = $5, active = $6
	`
	_, err := r.db.Exec(
		query,
		group.ID,
		group.Name,
		group.Description,
		group.CreatedAt,
		group.UpdatedAt,
		group.Active,
	)

	if err != nil {
		return fmt.Errorf("error saving group: %v", err)
	}

	return nil
}

// GetGroupByID retrieves a group by its ID
func (r *GroupRepository) GetGroupByID(id string) (models.Group, error) {
	query := `
		SELECT id, name, description, created_at, updated_at, active
		FROM line_groups
		WHERE id = $1
	`
	var group models.Group
	err := r.db.QueryRow(query, id).Scan(
		&group.ID,
		&group.Name,
		&group.Description,
		&group.CreatedAt,
		&group.UpdatedAt,
		&group.Active,
	)

	if err != nil {
		return models.Group{}, fmt.Errorf("error retrieving group: %v", err)
	}

	return group, nil
}

// UpdateGroup updates an existing group
func (r *GroupRepository) UpdateGroup(group models.Group) error {
	query := `
		UPDATE line_groups
		SET name = $1, description = $2, updated_at = $3, active = $4
		WHERE id = $5
	`
	_, err := r.db.Exec(
		query,
		group.Name,
		group.Description,
		time.Now(),
		group.Active,
		group.ID,
	)

	if err != nil {
		return fmt.Errorf("error updating group: %v", err)
	}

	return nil
}

// DeleteGroup removes a group from the database
func (r *GroupRepository) DeleteGroup(id string) error {
	query := `
		DELETE FROM line_groups
		WHERE id = $1
	`
	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error deleting group: %v", err)
	}

	return nil
}

// ListGroups retrieves all groups
func (r *GroupRepository) ListGroups() ([]models.Group, error) {
	query := `
		SELECT id, name, description, created_at, updated_at, active
		FROM line_groups
		ORDER BY name
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error listing groups: %v", err)
	}
	defer rows.Close()

	var groups []models.Group
	for rows.Next() {
		var group models.Group
		err := rows.Scan(
			&group.ID,
			&group.Name,
			&group.Description,
			&group.CreatedAt,
			&group.UpdatedAt,
			&group.Active,
		)

		if err != nil {
			return nil, fmt.Errorf("error scanning group row: %v", err)
		}

		groups = append(groups, group)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating group rows: %v", err)
	}

	return groups, nil
}
