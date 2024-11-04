//backend/internal/InventoryManagement/infrastructure/repositories/transaction_data.go

package data

import "backend/internal/InventoryManagement/domain/models"

// TransactionRepository defines methods for transaction data.
type TransactionRepository interface {
	RecordTransaction(transaction models.Transaction) error
	GetTransactionsByItem(itemID string) ([]models.Transaction, error)
}
