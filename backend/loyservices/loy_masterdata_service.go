package loyservices

import (
	"backend/models"
	"backend/utils"
	"encoding/json"
	"log"
	"os"
)

// API Endpoints สำหรับ Master Data
const (
	CategoriesAPIEndpoint   = "https://api.loyverse.com/v1.0/categories?limit=250"
	ItemsAPIEndpoint        = "https://api.loyverse.com/v1.0/items?limit=250"
	PaymentTypesAPIEndpoint = "https://api.loyverse.com/v1.0/payment_types?limit=250"
	StoresAPIEndpoint       = "https://api.loyverse.com/v1.0/stores?limit=250"
	SuppliersAPIEndpoint    = "https://api.loyverse.com/v1.0/suppliers?limit=250"
)

// FetchMasterData ดึงข้อมูล master data ทั้งหมดจาก Loyverse API
func FetchMasterData() (models.LoyMasterData, error) {
	token := os.Getenv("LOYVERSE_API_TOKEN")
	var masterData models.LoyMasterData

	// Fetch Categories
	if err := fetchData(CategoriesAPIEndpoint, token, &masterData.Categories); err != nil {
		log.Println("Error fetching categories:", err)
		return masterData, err
	}

	// Fetch Items
	if err := fetchData(ItemsAPIEndpoint, token, &masterData.Items); err != nil {
		log.Println("Error fetching items:", err)
		return masterData, err
	}

	// Fetch Payment Types
	if err := fetchData(PaymentTypesAPIEndpoint, token, &masterData.PaymentTypes); err != nil {
		log.Println("Error fetching payment types:", err)
		return masterData, err
	}

	// Fetch Stores
	if err := fetchData(StoresAPIEndpoint, token, &masterData.Stores); err != nil {
		log.Println("Error fetching stores:", err)
		return masterData, err
	}

	// Fetch Suppliers
	if err := fetchData(SuppliersAPIEndpoint, token, &masterData.Suppliers); err != nil {
		log.Println("Error fetching suppliers:", err)
		return masterData, err
	}

	log.Println("Fetched master data from API successfully.")
	return masterData, nil
}

// Helper function สำหรับ fetch data จาก API
func fetchData(endpoint, token string, result interface{}) error {
	body, err := utils.MakeGetRequest(endpoint, token)
	if err != nil {
		return err
	}

	// เลือกโครงสร้าง JSON ที่เหมาะสมตาม Endpoint
	switch endpoint {
	case CategoriesAPIEndpoint:
		var categoriesResponse struct {
			Categories []models.LoyCategory `json:"categories"`
		}
		if err := json.Unmarshal(body, &categoriesResponse); err != nil {
			log.Println("Error parsing categories response:", err)
			return err
		}
		*result.(*[]models.LoyCategory) = categoriesResponse.Categories

	case ItemsAPIEndpoint:
		var itemsResponse struct {
			Items []models.LoyItem `json:"items"`
		}
		if err := json.Unmarshal(body, &itemsResponse); err != nil {
			log.Println("Error parsing items response:", err)
			return err
		}
		*result.(*[]models.LoyItem) = itemsResponse.Items

	case PaymentTypesAPIEndpoint:
		var paymentTypesResponse struct {
			PaymentTypes []models.LoyPaymentType `json:"payment_types"`
		}
		if err := json.Unmarshal(body, &paymentTypesResponse); err != nil {
			log.Println("Error parsing payment types response:", err)
			return err
		}
		*result.(*[]models.LoyPaymentType) = paymentTypesResponse.PaymentTypes

	case StoresAPIEndpoint:
		var storesResponse struct {
			Stores []models.LoyStore `json:"stores"`
		}
		if err := json.Unmarshal(body, &storesResponse); err != nil {
			log.Println("Error parsing stores response:", err)
			return err
		}
		*result.(*[]models.LoyStore) = storesResponse.Stores

	case SuppliersAPIEndpoint:
		var suppliersResponse struct {
			Suppliers []models.LoySupplier `json:"suppliers"`
		}
		if err := json.Unmarshal(body, &suppliersResponse); err != nil {
			log.Println("Error parsing suppliers response:", err)
			return err
		}
		*result.(*[]models.LoySupplier) = suppliersResponse.Suppliers

	default:
		log.Println("Unknown endpoint:", endpoint)
		return nil
	}

	return nil
}
