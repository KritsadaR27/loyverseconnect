// frontend/app/po/components/OrderQuantityInput.js

import React, { useState, useEffect } from 'react';

// Input สำหรับช่องยอดสั่ง
export const OrderQuantityInput = React.memo(({ 
  itemId, 
  value,       // ✅ เปลี่ยนตรงนี้
  suggestedValue,
  onChange 
}) => {
  return (
    <input
      type="number"
      min="0"
      value={value}  // ✅ ใช้ value ตรงๆ จาก parent
      onChange={(e) => {
        const newVal = e.target.value === '' ? '' : Number(e.target.value);
        onChange(itemId, newVal === '' ? 0 : newVal);
      }}
      className={`w-20 mx-auto text-center border rounded px-1 py-1 text-sm ${
        (value || 0) !== (suggestedValue || 0) ? 'bg-yellow-50 border-yellow-300' : ''
      }`}
    />
  );
});
