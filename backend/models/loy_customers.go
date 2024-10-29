package models

type LoyCustomer struct {
	CustomerID  string `json:"customer_id"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
}

type LoyCustomersResponse struct {
	Customers []LoyCustomer `json:"customers"`
	Cursor    string        `json:"cursor"`
}
