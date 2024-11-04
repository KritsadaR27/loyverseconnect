"use client";

import React, { useState, useEffect } from "react";
import Navigation from '../../../components/Navigation';


const SyncDataPage = () => {
    const [settings, setSettings] = useState({ inventory_sync_time: "03:00", receipts_sync_time: "04:30" });
    const [status, setStatus] = useState("");
    const [userRole, setUserRole] = useState(null);
    const handleExportToGoogleSheet = async () => {
        try {
            const response = await fetch('http://localhost:8082/api/export-to-google-sheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response); // Debugging response

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const message = await response.text(); // รับข้อความตอบกลับ
            console.log('Data exported to Google Sheet:', message);
            alert('ข้อมูลถูกส่งไปยัง Google Sheets เรียบร้อยแล้ว!');
        } catch (error) {
            console.error('Error exporting to Google Sheet:', error);
            alert('เกิดข้อผิดพลาดในการส่งข้อมูลไปยัง Google Sheets');
        }
    };
    
    // ตั้งค่า userRole เป็น 'super' เพื่อทดสอบ
    useEffect(() => {
        setUserRole("super"); // สมมติ role เป็น 'super' สำหรับการทดสอบ
        // Fetch current settings
        fetch("http://localhost:8080/api/get-settings")
            .then((res) => res.json())
            .then((data) => setSettings(data))
            .catch((err) => console.error("Failed to fetch settings:", err));
    }, []);

    // ตรวจสอบสิทธิ์ของผู้ใช้
    if (userRole !== "super") {
        return (
            <p className="text-red-600 text-center mt-10 text-lg font-semibold">
                Access Denied
            </p>
        );
    }

    // ฟังก์ชันสำหรับบันทึกการตั้งค่า
    const handleSave = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/update-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (response.ok) setStatus("Settings updated successfully!");
            else setStatus("Failed to update settings");
        } catch (error) {
            setStatus("Error updating settings");
        }
    };

    // ฟังก์ชันสำหรับการเปลี่ยนแปลงค่าการตั้งค่า
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((prev) => ({ ...prev, [name]: value }));
    };

    // ฟังก์ชันสำหรับซิงค์แต่ละประเภท
    const handleSync = async (endpoint) => {
        try {
            const response = await fetch(endpoint, { method: "POST" });
            if (response.ok) {
                setStatus(`Data synced successfully from ${endpoint}`);
            } else {
                setStatus(`Failed to sync data from ${endpoint}`);
            }
        } catch (error) {
            setStatus("Error: Could not complete sync");
        }
    };

    return (
       
        <div> <Navigation /> 
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 space-y-8">
            <h2 className="text-2xl font-bold text-blue-600">
                Data Sync Settings & Actions  
            </h2>

            <div className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4">Sync Time Settings</h3>
                <div>
                    <label className="block font-medium">Inventory Sync Time:</label>
                    <input
                        type="time"
                        name="inventory_sync_time"
                        value={settings.inventory_sync_time}
                        onChange={handleChange}
                        className="border p-1 rounded w-full mt-1"
                    />
                </div>
                <div>
                    <label className="block font-medium">Receipts Sync Time:</label>
                    <input
                        type="time"
                        name="receipts_sync_time"
                        value={settings.receipts_sync_time}
                        onChange={handleChange}
                        className="border p-1 rounded w-full mt-1"
                    />
                </div>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
                    Save Settings
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4">Manual Data Sync</h3>
                <button 
                    onClick={() => handleSync("http://localhost:8080/api/sync-master-data")}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600 transition duration-200"
                >
                    Sync Master Data
                </button>
                <button 
                    onClick={() => handleSync("http://localhost:8080/api/sync-receipts")}
                    className="bg-green-500 text-white px-4 py-2 rounded-md w-full hover:bg-green-600 transition duration-200"
                >
                    Sync Receipts
                </button>
                <button 
                    onClick={() => handleSync("http://localhost:8080/api/sync-inventory-levels")}
                    className="bg-purple-500 text-white px-4 py-2 rounded-md w-full hover:bg-purple-600 transition duration-200"
                >
                    Sync Inventory Levels
                </button>
                <button 
                        onClick={handleExportToGoogleSheet}
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                    >
                        ส่งข้อมูลไปยัง Google Sheets :t
                    </button> 
            </div>
 
            {status && (
                <p className="mt-6 text-lg font-medium text-gray-700 text-center">{status}</p>
            )}
        </div> </div>
    );
};

export default SyncDataPage;
