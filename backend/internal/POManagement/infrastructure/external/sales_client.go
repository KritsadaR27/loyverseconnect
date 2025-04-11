// internal/POManagement/infrastructure/external/sales_client.go
package external

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"backend/internal/POManagement/domain/interfaces"
	"backend/internal/POManagement/domain/models"
)

// SalesClient เชื่อมต่อกับ Sales API
type SalesClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewSalesClient สร้าง SalesClient ใหม่
func NewSalesClient() interfaces.SalesService {
	baseURL := os.Getenv("SALES_SERVICE_URL")
	if baseURL == "" {
		baseURL = "http://sale-management:8084"
	}

	return &SalesClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GetSalesByDay ดึงข้อมูลยอดขายตามวัน
func (c *SalesClient) GetSalesByDay(ctx context.Context, startDate, endDate time.Time) ([]models.SalesByDay, error) {
	// สร้าง request
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		fmt.Sprintf(
			"%s/api/sales/days?startDate=%s&endDate=%s",
			c.baseURL,
			startDate.Format(time.RFC3339),
			endDate.Format(time.RFC3339),
		),
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	// ส่ง request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error getting sales data: %w", err)
	}
	defer resp.Body.Close()

	// ตรวจสอบสถานะ
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// แยกวิเคราะห์ผลตอบกลับ
	var salesData []models.SalesByDay
	if err := json.NewDecoder(resp.Body).Decode(&salesData); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	return salesData, nil
}
