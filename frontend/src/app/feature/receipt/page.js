// src/app/CreateReceipt/page.js
'use client';  // เพิ่มบรรทัดนี้

import { useState } from 'react';
import axios from 'axios';

export default function CreateReceipt() {
  const [items, setItems] = useState([]);
  const [confirm, setConfirm] = useState(false);

  const fetchItems = async () => {
    const response = await axios.get('/api/receipts');
    setItems(response.data);
  };

  const handleConfirm = () => {
    setConfirm(true);
  };

  const handleCreateReceipt = async () => {
    const response = await axios.post('/api/create-receipt', { items });
    console.log(response.data);
  };

  return ( 
    <div>
      <h1>Create Receipt</h1>
      <button onClick={fetchItems}>Fetch Items</button>
      {confirm ? (
        <div>
          <h2>Confirm Receipt</h2>
          <button onClick={handleCreateReceipt}>Confirm</button>
        </div>
      ) : (
        <button onClick={handleConfirm}>Review Receipt</button>
      )}
    </div>
  );
}
