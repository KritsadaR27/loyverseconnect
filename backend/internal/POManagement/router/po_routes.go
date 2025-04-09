package router

import (
	"backend/internal/POManagement/domain/models"
	"net/http"

	"github.com/gin-gonic/gin" // หรือ framework อื่นที่คุณใช้

	"backend/internal/POManagement/domain/interfaces"
)

// RegisterPORoutes registers the purchase order routes
func RegisterPORoutes(
	router *gin.Engine,
	poService interfaces.PurchaseOrderService,
) {
	poGroup := router.Group("/api/purchase-orders")
	{
		poGroup.POST("", createPurchaseOrder(poService))
		poGroup.GET("", getAllPurchaseOrders(poService))
		poGroup.GET("/:id", getPurchaseOrderByID(poService))
		poGroup.PUT("/:id", updatePurchaseOrder(poService))
		poGroup.DELETE("/:id", deletePurchaseOrder(poService))

		poGroup.POST("/:id/items", addItemToPurchaseOrder(poService))
		poGroup.GET("/:id/items", getPurchaseOrderItems(poService))
		poGroup.PUT("/:id/items/:itemId", updatePurchaseOrderItem(poService))
		poGroup.DELETE("/:id/items/:itemId", deletePurchaseOrderItem(poService))

		// Approval workflow
		poGroup.POST("/:id/approve", approvePO(poService))
		poGroup.POST("/:id/reject", rejectPO(poService))
		poGroup.POST("/:id/cancel", cancelPO(poService))

		// Receipt management
		poGroup.POST("/:id/receipts", createPOReceipt(poService))
		poGroup.GET("/:id/receipts", getPOReceipts(poService))

		// History
		poGroup.GET("/:id/history", getPOHistory(poService))

		// Analytics
		poGroup.GET("/analytics", getPOAnalytics(poService))
		poGroup.GET("/suppliers/:supplierId/performance", getSupplierPerformance(poService))
	}
}

func createPurchaseOrder(poService interfaces.PurchaseOrderService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var po models.PurchaseOrder
		if err := c.ShouldBindJSON(&po); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := poService.CreatePurchaseOrder(c.Request.Context(), &po); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, po)
	}
}

// Implement other handler functions
