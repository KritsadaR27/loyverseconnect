// internal/POManagement/infrastructure/external/inventory_client.go
package external

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"backend/internal/POManagement/domain/interfaces"
	"backend/internal/POManagement/domain/models"
)

// InventoryClient เชื่อมต่อกับ Inventory API
type InventoryClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewInventoryClient สร้าง InventoryClient ใหม่
func NewInventoryClient() interfaces.InventoryService {
	baseURL := os.Getenv("INVENTORY_SERVICE_URL")
	if baseURL == "" {
		baseURL = "http://inventory-management:8082"
	}

	return &InventoryClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GetItemStock ดึงข้อมูลสต็อกสินค้า
func (c *InventoryClient) GetItemStock(ctx context.Context) ([]models.ItemStockData, error) {
	// สร้าง request
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/item-stock", c.baseURL), nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	// ส่ง request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error getting item stock: %w", err)
	}
	defer resp.Body.Close()

	// ตรวจสอบสถานะ
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// แยกวิเคราะห์ผลตอบกลับ
	var items []models.ItemStockData
	if err := json.NewDecoder(resp.Body).Decode(&items); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	return items, nil
}

// GetStoreStock ดึงข้อมูลสต็อกตามสาขา
func (c *InventoryClient) GetStoreStock(ctx context.Context, itemIDs []string) (map[string][]models.StoreStock, error) {
	if len(itemIDs) == 0 {
		return make(map[string][]models.StoreStock), nil
	}

	// เตรียม query parameters
	params := strings.Join(itemIDs, ",")

	// สร้าง request
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		fmt.Sprintf("%s/api/item-stock/store?item_ids=%s", c.baseURL, params),
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	// ส่ง request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error getting store stock: %w", err)
	}
	defer resp.Body.Close()

	// ตรวจสอบสถานะ
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// แยกวิเคราะห์ผลตอบกลับ
	var storeStocks map[string][]models.StoreStock
	if err := json.NewDecoder(resp.Body).Decode(&storeStocks); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	return storeStocks, nil
}
