package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
)

// PurchaseOrder represents the purchase order data structure
type PurchaseOrder struct {
	ID          int      `json:"id"`
	VendorID    int      `json:"vendor_id"`
	OrderDate   string   `json:"order_date"`
	TotalAmount float64  `json:"total_amount"`
	Status      string   `json:"status"`
	Items       []POItem `json:"items"`
}

// POItem represents an item in a purchase order
type POItem struct {
	ID         int     `json:"id"`
	ProductID  int     `json:"product_id"`
	Quantity   int     `json:"quantity"`
	UnitPrice  float64 `json:"unit_price"`
	TotalPrice float64 `json:"total_price"`
}

// In-memory database for demo purposes
var purchaseOrders = []PurchaseOrder{
	{
		ID:          1,
		VendorID:    101,
		OrderDate:   "2025-04-01",
		TotalAmount: 5000.00,
		Status:      "pending",
		Items: []POItem{
			{ID: 1, ProductID: 5001, Quantity: 10, UnitPrice: 500.00, TotalPrice: 5000.00},
		},
	},
}

func main() {
	// Define routes
	http.HandleFunc("/po", handlePurchaseOrders)
	http.HandleFunc("/po/", handlePurchaseOrderByID)

	// Start server
	port := 8080
	fmt.Printf("Starting PO Management server on port %d...\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func handlePurchaseOrders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case "GET":
		// List all purchase orders
		json.NewEncoder(w).Encode(purchaseOrders)

	case "POST":
		// Create new purchase order
		var po PurchaseOrder
		if err := json.NewDecoder(r.Body).Decode(&po); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Set new ID (in real app, this would be handled by the database)
		po.ID = len(purchaseOrders) + 1

		// Calculate total price for each item and overall total
		var totalAmount float64
		for i := range po.Items {
			po.Items[i].TotalPrice = float64(po.Items[i].Quantity) * po.Items[i].UnitPrice
			totalAmount += po.Items[i].TotalPrice
		}
		po.TotalAmount = totalAmount

		purchaseOrders = append(purchaseOrders, po)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(po)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handlePurchaseOrderByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extract ID from URL
	idStr := strings.TrimPrefix(r.URL.Path, "/po/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// Find purchase order by ID
	var po *PurchaseOrder
	for i := range purchaseOrders {
		if purchaseOrders[i].ID == id {
			po = &purchaseOrders[i]
			break
		}
	}

	if po == nil {
		http.Error(w, "Purchase order not found", http.StatusNotFound)
		return
	}

	switch r.Method {
	case "GET":
		json.NewEncoder(w).Encode(po)

	case "PUT":
		var updatedPO PurchaseOrder
		if err := json.NewDecoder(r.Body).Decode(&updatedPO); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		updatedPO.ID = id // Ensure ID doesn't change

		// Update purchase order
		for i := range purchaseOrders {
			if purchaseOrders[i].ID == id {
				purchaseOrders[i] = updatedPO
				break
			}
		}

		json.NewEncoder(w).Encode(updatedPO)

	case "DELETE":
		// Remove purchase order
		for i := range purchaseOrders {
			if purchaseOrders[i].ID == id {
				purchaseOrders = append(purchaseOrders[:i], purchaseOrders[i+1:]...)
				break
			}
		}

		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
