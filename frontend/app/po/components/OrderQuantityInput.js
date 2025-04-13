// frontend/app/po/components/OrderQuantityInput.js

import React, { useState, useEffect } from 'react';

// Input สำหรับช่องยอดสั่ง
export const OrderQuantityInput = React.memo(({ 
  itemId, 
  initialValue, 
  suggestedValue,
  onChange 
}) => {
  const [value, setValue] = useState(initialValue || 0);
  
  // อัปเดตค่าเริ่มต้นเมื่อ props เปลี่ยน (เฉพาะเมื่อ initialValue เปลี่ยนเท่านั้น)
  useEffect(() => {
    setValue(initialValue || 0);
  }, [initialValue]);
  
  return (
    <input
      type="number"
      min="0"
      value={value}
      onChange={(e) => {
        const newVal = e.target.value === '' ? '' : Number(e.target.value);
        setValue(newVal);
        onChange(itemId, newVal === '' ? 0 : newVal);
      }}
      className={`w-20 mx-auto text-center border rounded px-1 py-1 text-sm ${
        (initialValue || 0) !== (suggestedValue || 0) ? 'bg-yellow-50 border-yellow-300' : ''
      }`}
    />
  );
});
