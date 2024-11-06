package interfaces

import (
	"backend/internal/SaleManagement/domain/models"
	"time"
)

type ReceiptRepository interface {
	FetchReceiptsWithDetails(limit, offset int) ([]models.Receipt, error) // เพิ่ม limit และ offset
	FetchSalesByItem(limit, offset int) ([]models.SaleItem, error)
	FetchSalesByDay(startDate, endDate time.Time) ([]models.SalesByDay, error)
	// FetchSalesByDay() ([]models.SalesByDay, error) // ฟังก์ชันใหม่สำหรับช่วงวันที่คงที่

}
