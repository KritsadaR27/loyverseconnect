package handlers

import (
	"backend/models"
	"backend/services"
	"database/sql"
	"encoding/json"
	"net/http"
)

// MakeHandleListPurchaseOrders สร้าง handler สำหรับแสดงรายการ PO ที่จัดกลุ่มตาม "วันที่รับของ"
func MakeHandleListPurchaseOrders(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		groupedPOs, err := services.ListPurchaseOrdersService(db)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(groupedPOs)
	}
}

// MakeHandleCreatePurchaseOrder สร้าง handler สำหรับการสร้าง PO ใหม่
func MakeHandleCreatePurchaseOrder(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var po models.PurchaseOrder
		if err := json.NewDecoder(r.Body).Decode(&po); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		err := services.CreatePurchaseOrderService(db, po)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("PO created successfully"))
	}
}

// MakeHandleEditPurchaseOrder สร้าง handler สำหรับการแก้ไข PO
func MakeHandleEditPurchaseOrder(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var po models.PurchaseOrder
		if err := json.NewDecoder(r.Body).Decode(&po); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		err := services.EditPurchaseOrderService(db, po)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Write([]byte("PO updated successfully"))
	}
}

// MakeHandleUpdateSortOrder สร้าง handler สำหรับอัปเดตลำดับการจัดเรียง PO
func MakeHandleUpdateSortOrder(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var sortedItems []models.PurchaseOrder
		if err := json.NewDecoder(r.Body).Decode(&sortedItems); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		err := services.UpdateSortOrderService(db, sortedItems)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Write([]byte("Sort order updated successfully"))
	}
}

func MakeHandleSaveOrder(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var order models.PurchaseOrder
		if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		if err := services.SaveOrderService(db, order); err != nil {
			http.Error(w, "Failed to save order", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Order saved successfully"))
	}
}
