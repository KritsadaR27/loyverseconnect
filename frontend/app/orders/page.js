// pages/orders.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/orders');
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Orders</h1>
            <ul>
                {orders.map(order => (
                    <li key={order.id}>
                        {order.customerName} - {order.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrdersPage;