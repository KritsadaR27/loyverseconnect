// backend/internal/InventoryManagement/domain/models/category.go
package models

import (
	"database/sql"
	"time"
)

type Category struct {
	CategoryID string         `json:"category_id"` // Unique identifier for the category
	Name       string         `json:"name"`        // Category name
	Color      sql.NullString `json:"color"`       // Optional color code for display
	CreatedAt  time.Time      `json:"created_at"`  // Creation timestamp
	DeletedAt  sql.NullTime   `json:"deleted_at"`  // Soft delete timestamp
}
