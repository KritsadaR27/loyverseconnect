// services/po_notification.go
package services

import "backend/internal/POManagement/domain/models"

type PONotificationService interface {
	NotifyPOCreated(po *models.PurchaseOrder)
	NotifyPOApproved(po *models.PurchaseOrder)
	NotifyPORejected(po *models.PurchaseOrder, reason string)
	NotifyPOReceived(receipt *models.POReceipt)
}
