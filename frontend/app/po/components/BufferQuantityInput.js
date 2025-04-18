import React, { useState, useEffect } from 'react';

export const BufferQuantityInput = React.memo(({ 
  itemId, 
  initialValue, 
  onChange,
  disabled
}) => {
  const [localValue, setLocalValue] = useState(initialValue);

  // Sync ค่าเริ่มต้นจาก parent เมื่อเปลี่ยน
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setLocalValue('');
    } else if (!isNaN(Number(val))) {
      setLocalValue(Number(val));
    }
  };

  const handleBlur = () => {
    const valueToSend = localValue === '' ? 0 : Number(localValue);
    onChange?.(itemId, valueToSend);
  };

  return (
    <input
      type="number"
      min="0"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className="w-20 mx-auto text-center border rounded px-1 py-1 text-sm"
    />
  );
});
