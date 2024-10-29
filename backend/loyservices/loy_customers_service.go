package loyservices

import (
	"backend/models"
	"backend/utils"
	"encoding/json"
	"log"
	"os"
)

const CustomersAPIEndpoint = "https://api.loyverse.com/v1.0/customers"

func FetchCustomers() ([]models.LoyCustomer, error) {
	token := os.Getenv("LOYVERSE_API_TOKEN")
	body, err := utils.MakeGetRequest(CustomersAPIEndpoint, token)
	if err != nil {
		log.Println("Error fetching customers:", err)
		return nil, err
	}

	var customersResponse models.LoyCustomersResponse
	if err := json.Unmarshal(body, &customersResponse); err != nil {
		log.Println("Error parsing customers response:", err)
		return nil, err
	}

	return customersResponse.Customers, nil
}
