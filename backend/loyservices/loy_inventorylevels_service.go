package loyservices

import (
	"backend/models"
	"backend/utils"
	"encoding/json"
	"fmt"
	"log"
	"os"
)

const InventoryLevelsAPIEndpoint = "https://api.loyverse.com/v1.0/inventory"
const InventoryLimit = 250

// FetchInventoryLevels fetches inventory levels from Loyverse API
func FetchInventoryLevels() ([]models.LoyInventoryLevel, error) {
	token := os.Getenv("LOYVERSE_API_TOKEN")
	var allInventoryLevels []models.LoyInventoryLevel
	cursor := ""

	for {
		endpoint := fmt.Sprintf("%s?limit=%d", InventoryLevelsAPIEndpoint, InventoryLimit)
		if cursor != "" {
			endpoint += "&cursor=" + cursor
		}

		body, err := utils.MakeGetRequest(endpoint, token)
		if err != nil {
			log.Println("Error fetching inventory levels:", err)
			return nil, err
		}

		var inventoryLevelsResponse models.LoyInventoryLevelsResponse
		if err := json.Unmarshal(body, &inventoryLevelsResponse); err != nil {
			log.Println("Error parsing inventory levels response:", err)
			return nil, err
		}

		// Add fetched data to allInventoryLevels
		allInventoryLevels = append(allInventoryLevels, inventoryLevelsResponse.InventoryLevels...)

		// Check if there's a next page
		if inventoryLevelsResponse.Cursor == "" {
			break
		}
		cursor = inventoryLevelsResponse.Cursor
	}

	return allInventoryLevels, nil
}
