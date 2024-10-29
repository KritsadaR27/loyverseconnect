// src/pages/api/proxy.js
import axios from 'axios';

export default async function handler(req, res) {
    try {
        const { endpoint } = req.query; // Expect the client to pass endpoint like `/suppliers/`
        const response = await axios.get(`https://api.loyverse.com/v1.0${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${process.env.API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error in proxy:", error.message);
        res.status(500).json({ message: "Failed to fetch data from API." });
    }
}
