// backend/internal/InventoryManagement/infrastructure/repositories/store_data.go
package data

import "backend/internal/InventoryManagement/domain/models"

// StoreRepository defines methods for accessing store data.
type StoreRepository interface {
	// GetStoreByID fetches details of a specific store by its ID.
	GetStoreByID(storeID string) (models.Store, error)

	// GetAllStores retrieves a list of all stores.
	GetAllStores() ([]models.Store, error)

	// AddStore adds a new store to the system (optional based on requirements).
	AddStore(store models.Store) error
}
