// backend/external/AirtableConnect/infrastructure/data/view_repository.go
package data

import (
	"backend/external/AirtableConnect/domain/interfaces"
	"backend/external/AirtableConnect/domain/models"
	"database/sql"
)

type ViewRepository struct {
	db *sql.DB
}

func NewViewRepository(db *sql.DB) interfaces.ViewRepository {
	return &ViewRepository{db: db}
}

func (r *ViewRepository) GetViewsByTableID(tableID string) ([]models.View, error) {
	rows, err := r.db.Query(`SELECT view_id, view_name FROM airtable_views WHERE table_id = $1 ORDER BY view_name`, tableID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var views []models.View
	for rows.Next() {
		var v models.View
		if err := rows.Scan(&v.ViewID, &v.ViewName); err != nil {
			return nil, err
		}
		views = append(views, v)
	}
	return views, nil
}
