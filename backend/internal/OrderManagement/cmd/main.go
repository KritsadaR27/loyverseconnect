// main.go
package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

type Order struct {
	ID           int    `json:"id"`
	CustomerName string `json:"customer_name"`
	Status       string `json:"status"`
}

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("postgres", "user=youruser dbname=yourdb sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/api/orders", getOrders)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func getOrders(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, customer_name, status FROM orders")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var order Order
		if err := rows.Scan(&order.ID, &order.CustomerName, &order.Status); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		orders = append(orders, order)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}
