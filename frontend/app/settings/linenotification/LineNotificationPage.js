"use client";

import React, { useState, useEffect } from "react";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import LineNotificationActionBar from "./components/LineNotificationActionBar";
import LineNotificationForm from "./components/LineNotificationForm";
import Alert from "../../../components/Alert";

const LineNotificationPage = () => {
  const [config, setConfig] = useState({
    headerTemplate: "วันนี้ %s %s มีจัดส่ง %d กล่อง",
    enableBubbles: true,
    bubbleFields: ["OrderName", "CustomerName", "PickupPoint", "PhoneNumber", "OrderNumber"],
    notificationTimes: ["08:00", "14:00"],
    groupIDs: [],
    tableID: "",
    viewName: "",
  });
  
  const [tableOptions, setTableOptions] = useState([]);
  const [viewOptions, setViewOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available tables, views, and fields
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_AIRTABLE_CONNECT_URL || 'http://localhost:8086';
        
        // Fetch tables
        const tablesResponse = await fetch(`${apiUrl}/api/airtable/tables`);
        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json();
          setTableOptions(tablesData.map(table => ({
            id: table.airtable_id,
            name: table.name
          })));
        }

        // Fetch LINE groups
        const groupsResponse = await fetch(`${apiUrl}/api/line/groups`);
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          setGroupOptions(groupsData.map(group => ({
            id: group.id,
            name: group.name
          })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlert({
          type: "error",
          message: "Failed to load configuration data"
        });
      }
    };
    
    fetchTableData();
  }, []);

  // When tableID changes, fetch available views
  useEffect(() => {
    const fetchViews = async () => {
      if (!config.tableID) return;
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_AIRTABLE_CONNECT_URL || 'http://localhost:8086';
        const response = await fetch(`${apiUrl}/api/airtable/records?table_id=${config.tableID}`);
        
        if (response.ok) {
          const data = await response.json();
          // Extract unique view names if available in the response
          // This is an assumption - adjust based on actual API response
          const views = [...new Set(data.map(record => record.view_name).filter(Boolean))];
          setViewOptions(views.map(view => ({
            id: view,
            name: view
          })));
          
          // Extract field names from the first record
          if (data.length > 0) {
            const firstRecord = data[0];
            const fields = Object.keys(firstRecord.fields || {});
            setFieldOptions(fields.map(field => ({
              id: field,
              name: field
            })));
          }
        }
      } catch (error) {
        console.error("Error fetching views:", error);
      }
    };
    
    fetchViews();
  }, [config.tableID]);

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_AIRTABLE_CONNECT_URL || 'http://localhost:8086';
      
      // Create the request body
      const requestBody = {
        table_id: config.tableID,
        view_name: config.viewName,
        header_template: config.headerTemplate,
        enable_bubbles: config.enableBubbles,
        fields: config.bubbleFields,
        notification_times: config.notificationTimes,
        group_ids: config.groupIDs
      };
      
      const response = await fetch(`${apiUrl}/api/airtable/notify/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        setAlert({
          type: "success",
          message: "Notification settings saved successfully"
        });
      } else {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to save notification settings");
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
      setAlert({
        type: "error",
        message: error.message || "Failed to save notification settings"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_AIRTABLE_CONNECT_URL || 'http://localhost:8086';
      
      // Create the request body for sending a test notification
      const requestBody = {
        table_id: config.tableID,
        view_name: config.viewName,
        fields: config.bubbleFields,
        group_ids: config.groupIDs
      };
      
      const response = await fetch(`${apiUrl}/api/airtable/notify/bubbles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const responseData = await response.json();
        setAlert({
          type: "success",
          message: `Test notification sent successfully! ${responseData.recordCount} records sent.`
        });
      } else {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to send test notification");
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      setAlert({
        type: "error",
        message: error.message || "Failed to send test notification"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarLayout
      headerTitle="LINE Notification Settings"
      actionBar={
        <LineNotificationActionBar
          onSave={handleSaveConfig}
          onTest={handleTestNotification}
          isLoading={isLoading}
        />
      }
    >
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      <LineNotificationForm
        config={config}
        setConfig={setConfig}
        tableOptions={tableOptions}
        viewOptions={viewOptions}
        groupOptions={groupOptions}
        fieldOptions={fieldOptions}
      />
    </SidebarLayout>
  );
};

export default LineNotificationPage;