package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"io/ioutil"
	"sort"
	"strings"
	"github.com/joho/godotenv"
	"os"
	"log"
)

const (

	baseURL       = "https://api.loyverse.com/v1.0"
	suppliersEP   = "/suppliers"
	itemsEP       = "/items"
)

var (
	apiToken string
	headers  = map[string]string{
		"Content-Type": "application/json",
	}
)
// โหลดค่าจากไฟล์ .env
func init() {
	// โหลดตัวแปรจากไฟล์ .env
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// ดึงค่า apiToken จาก Environment Variables
	apiToken = os.Getenv("LOYVERSE_API_TOKEN")

	// ตั้งค่า headers ที่จำเป็น
	headers["Authorization"] = "Bearer " + apiToken
}
func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func fetchFromAPI(endpoint string, limit int, cursor string) ([]byte, error) {
	client := &http.Client{}
	url := baseURL + endpoint + fmt.Sprintf("?limit=%d", limit)
	if cursor != "" {
		url += "&cursor=" + cursor
	}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Authorization", "Bearer "+apiToken)
	req.Header.Add("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return ioutil.ReadAll(resp.Body)
}
func FetchSuppliers() (map[string]string, error) {
	data, err := fetchFromAPI(suppliersEP,250,"")
	if err != nil {
		return nil, err
	}

	var result struct {
		Suppliers []struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"suppliers"`
	}
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, err
	}

	supplierMap := make(map[string]string)
	for _, supplier := range result.Suppliers {
		supplierMap[supplier.ID] = supplier.Name
	}

	return supplierMap, nil
}
func customSortItems(supplierName string, items []map[string]string) []map[string]string {
	switch supplierName {
	case "จัมโบ้":
		sort.SliceStable(items, func(i, j int) bool {
			// จัดเรียงสินค้า "จัมโบ้" ให้มาก่อน ตามด้วยชื่อสินค้าเรียง A-Z
			priorityOrder := []string{"จัมโบ้", "ไส้กรอกหมู", "ไส้กรอกข้าว", "ไส้กรอกแท่ง", "ขิงดอง"}
			itemA, itemB := items[i]["name"], items[j]["name"]

			// ค้นหาความสำคัญตามลำดับที่ระบุ
			getPriority := func(item string) int {
				for index, keyword := range priorityOrder {
					if strings.Contains(item, keyword) {
						return index
					}
				}
				// ให้เรียงตามตัวอักษรถ้าไม่มีคำที่อยู่ในลำดับพิเศษ
				return len(priorityOrder) + 1
			}

			// จัดเรียงตามลำดับความสำคัญ ถ้าเท่ากันให้เรียงตามตัวอักษร
			priorityA, priorityB := getPriority(itemA), getPriority(itemB)
			if priorityA == priorityB {
				return itemA < itemB
			}
			return priorityA < priorityB
		})

	case "หมูลุงรวย":
		sort.SliceStable(items, func(i, j int) bool {
			itemA, itemB := items[i]["name"], items[j]["name"]
			// ให้ "หมูปิ้ง" มาก่อนเสมอ ตามด้วยการเรียงตามตัวอักษร
			if strings.Contains(itemA, "หมูปิ้ง") {
				return true
			}
			if strings.Contains(itemB, "หมูปิ้ง") {
				return false
			}
			return itemA < itemB
		})

	case "ลูกชิ้น":
		// เรียงตามตัวอักษร A-Z ทั้งหมด
		sort.SliceStable(items, func(i, j int) bool {
			return items[i]["name"] < items[j]["name"]
		})
	}

	return items
}

func FetchItemsGroupedBySupplier() (map[string][]map[string]string, error) {
	supplierMap, err := FetchSuppliers()
	if err != nil {
		return nil, err
	}

	limit := 250
	cursor := ""
	groupedItems := make(map[string][]map[string]string)

	for {
		fmt.Printf("Fetching items with cursor: %s\n", cursor)
		data, err := fetchFromAPI(itemsEP, limit, cursor)
		if err != nil {
			return nil, err
		}

		var result struct {
			Items  []struct {
				ID               string `json:"id"`
				Name             string `json:"item_name"`
				PrimarySupplierID string `json:"primary_supplier_id"`
			} `json:"items"`
			Cursor string `json:"cursor"`
		}
		if err := json.Unmarshal(data, &result); err != nil {
			return nil, err
		}

		for _, item := range result.Items {
			supplierName := supplierMap[item.PrimarySupplierID]
			if supplierName == "" {
				supplierName = "Unknown Supplier"
			}
			groupedItems[supplierName] = append(groupedItems[supplierName], map[string]string{
				"id":   item.ID,
				"name": item.Name,
			})
		}

		if result.Cursor == "" {
			break
		}
		cursor = result.Cursor
	}

	// จัดเรียงรายการสินค้าตามเงื่อนไขที่กำหนด
	for supplier, items := range groupedItems {
		groupedItems[supplier] = customSortItems(supplier, items)
	}

	return groupedItems, nil
}
func handleFetchSuppliers(w http.ResponseWriter, r *http.Request) {
	enableCORS(&w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	items, err := FetchItemsGroupedBySupplier()
	if err != nil {
		http.Error(w, "Failed to fetch items", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func main() {
	http.HandleFunc("/api/getItemsFromSuppliers", handleFetchSuppliers)
	fmt.Println("Server is running on port 8080...")
	http.ListenAndServe(":8080", nil)
}
