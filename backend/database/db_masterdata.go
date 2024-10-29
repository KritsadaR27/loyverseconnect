package database

import (
	"backend/models"
	"database/sql"
	"encoding/json"
	"log"
)

// ClearOldData เคลียร์ข้อมูลเก่าในตารางที่เกี่ยวข้อง
func ClearOldMasterData(db *sql.DB) error {
	_, err := db.Exec("TRUNCATE TABLE loycategories, loyitems, loypaymenttypes, loystores, loysupplier RESTART IDENTITY")
	if err != nil {
		log.Println("Error clearing old data:", err)
		return err
	}
	log.Println("Old data cleared successfully.")
	return nil
}

// SaveMasterData บันทึก master data ทั้งหมดลงฐานข้อมูล
func SaveMasterData(db *sql.DB, data models.LoyMasterData) error {
	if err := SaveCategories(db, data.Categories); err != nil {
		return err
	}
	if err := SaveItems(db, data.Items); err != nil {
		return err
	}
	if err := SavePaymentTypes(db, data.PaymentTypes); err != nil {
		return err
	}
	if err := SaveStores(db, data.Stores); err != nil {
		return err
	}
	if err := SaveSuppliers(db, data.Suppliers); err != nil {
		return err
	}
	log.Println("Master data saved to database successfully.")
	return nil
}

// SaveItems บันทึกข้อมูลสินค้า (items) ลงในฐานข้อมูล
func SaveItems(db *sql.DB, items []models.LoyItem) error {
	for _, item := range items {
		// แปลง `Variants` ให้เป็น JSONB
		variantsJSON, err := json.Marshal(item.Variants)
		if err != nil {
			log.Println("Error marshalling variants:", err)
			return err
		}

		_, err = db.Exec(
			`INSERT INTO loyitems (item_id, item_name, description, category_id, primary_supplier_id, image_url, variants) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            ON CONFLICT (item_id) DO UPDATE 
            SET item_name = $2, description = $3, category_id = $4, primary_supplier_id = $5, image_url = $6, variants = $7`,
			item.ID, item.ItemName, item.Description, item.CategoryID, item.PrimarySupplierID, item.ImageURL, variantsJSON,
		)
		if err != nil {
			log.Println("Error saving item:", err)
			return err
		}
	}
	log.Println("Items saved successfully.")
	return nil
}

// SaveSuppliers บันทึกข้อมูลซัพพลายเออร์ (suppliers) ลงในฐานข้อมูล
func SaveSuppliers(db *sql.DB, suppliers []models.LoySupplier) error {
	for _, supplier := range suppliers {
		_, err := db.Exec("INSERT INTO loysupplier (supplier_id, supplier_name) VALUES ($1, $2) ON CONFLICT (supplier_id) DO UPDATE SET supplier_name = $2",
			supplier.SupplierID, supplier.SupplierName)
		if err != nil {
			log.Println("Error saving supplier:", err)
			return err
		}
	}
	log.Println("Suppliers saved successfully.")
	return nil
}

// SaveCategories บันทึกข้อมูลหมวดหมู่ (categories) ลงในฐานข้อมูล
func SaveCategories(db *sql.DB, categories []models.LoyCategory) error {
	for _, category := range categories {
		if category.CategoryID == "" {
			log.Println("Skipping category with empty category_id")
			continue
		}
		_, err := db.Exec(`
			INSERT INTO loycategories (category_id, name)
			VALUES ($1, $2)
			ON CONFLICT (category_id) DO UPDATE
			SET name = $2`,
			category.CategoryID, category.Name)
		if err != nil {
			log.Println("Error saving category:", err)
			return err
		}
	}
	log.Println("Categories saved successfully.")
	return nil
}

// SaveStores บันทึกข้อมูลสาขา (stores) ลงในฐานข้อมูล
func SaveStores(db *sql.DB, stores []models.LoyStore) error {
	for _, store := range stores {
		_, err := db.Exec(`
			INSERT INTO loystores (store_id, store_name)
			VALUES ($1, $2)
			ON CONFLICT (store_id) DO UPDATE 
			SET store_name = $2`,
			store.StoreID, store.StoreName,
		)
		if err != nil {
			log.Printf("Error saving store %s: %v", store.StoreID, err)
			return err
		}
	}
	log.Println("Stores saved successfully.")
	return nil
}

// SavePaymentTypes บันทึกข้อมูลประเภทการชำระเงิน (paymentTypes) ลงในฐานข้อมูล
func SavePaymentTypes(db *sql.DB, paymentTypes []models.LoyPaymentType) error {
	for _, paymenttype := range paymentTypes {
		if paymenttype.PaymentTypeID == "" { // ตรวจสอบให้แน่ใจว่า PaymentTypeID ไม่ว่าง
			log.Println("PaymentTypeID is empty, skipping this payment type.")
			continue
		}

		_, err := db.Exec("INSERT INTO loypaymenttypes (payment_type_id, name) VALUES ($1, $2) ON CONFLICT (payment_type_id) DO UPDATE SET name = $2",
			paymenttype.PaymentTypeID, paymenttype.Name)
		if err != nil {
			log.Println("Error saving payment type:", err)
			return err
		}
	}
	log.Println("PaymentTypes saved successfully.")
	return nil
}

// SaveCustomers บันทึกข้อมูล customers ลงในฐานข้อมูล
func SaveCustomers(db *sql.DB, customers []models.LoyCustomer) error {
	for _, customer := range customers {
		_, err := db.Exec("INSERT INTO loycustomers (customer_id, name, email, phone_number) VALUES ($1, $2, $3, $4) ON CONFLICT (customer_id) DO UPDATE SET name = $2, email = $3, phone_number = $4",
			customer.CustomerID, customer.Name, customer.Email, customer.PhoneNumber)
		if err != nil {
			log.Println("Error saving customer:", err)
			return err
		}
	}
	log.Println("Customers saved successfully.")
	return nil
}
