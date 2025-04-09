// backend/external/AirtableConnect/domain/models/field_mapping.go

package models

// FieldAlias เป็นแมปจากชื่อฟิลด์ภาษาไทยใน Airtable ไปยังชื่อมาตรฐานในระบบ
var FieldAlias = map[string]string{
	"ชื่อออเดอร์":         "OrderName",
	"Location":            "Location",
	"การจัดส่ง":           "DeliveryMethod",
	"การจ่ายเงิน":         "PaymentMethod",
	"กำหนดส่ง":            "DueDate",
	"ค่าส่ง":              "DeliveryFee",
	"จุดรับ":              "PickupPoint",
	"ชื่อลูกค้า":          "CustomerName",
	"น้ำหนักออเดอร์ (KG)": "WeightKG",
	"รวมเป็นเงิน":         "TotalAmount",
	"ลำดับส่ง":            "DeliveryOrder",
	"สาย":                 "Route",
	"ส่วนลด":              "Discount",
	"เบอร์รถ":             "TruckNumber",
	"เบอร์โทร":            "PhoneNumber",
	"เลขที่ออเดอร์":       "OrderNumber",
	"โซน":                 "Zone",
	"รายการสินค้า":        "ItemList",
}

// NormalizeFields แปลงฟิลด์จากภาษาไทยเป็นภาษาอังกฤษตามที่กำหนดใน FieldAlias
func NormalizeFields(fields map[string]interface{}) map[string]interface{} {
	mapped := make(map[string]interface{})
	for key, val := range fields {
		if alias, ok := FieldAlias[key]; ok {
			mapped[alias] = val
		} else {
			// fallback: keep original name if not mapped
			mapped[key] = val
		}
	}
	return mapped
}
