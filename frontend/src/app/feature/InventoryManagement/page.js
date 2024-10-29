"use client"; // เพิ่มบรรทัดนี้

import { useState } from 'react';
import axios from 'axios';

export default function TransferStock() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  const handleTransfer = async () => {
    const response = await axios.post('/api/transfer-stock', { source, destination });
    console.log(response.data);
  };

  return (
    <div>
      <h1>Transfer Stock</h1>
      <label>
        Source Location:
        <input type="text" value={source} onChange={(e) => setSource(e.target.value)} />
      </label>
      <label>
        Destination Location:
        <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} />
      </label>
      <button onClick={handleTransfer}>Transfer</button>
    </div>
  );
}
