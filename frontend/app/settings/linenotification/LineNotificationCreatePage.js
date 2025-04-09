"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "../../../../components/layouts/SidebarLayout";
import LineNotificationActionBar from "../components/LineNotificationActionBar";
import LineNotificationForm from "../components/LineNotificationForm";
import Alert from "../../../../components/Alert";
import { 
  createNotificationConfig, 
  fetchAirtableTables, 
  fetchAirtableRecordsFromView,
  fetchLineGroups,
  sendTestNotification
} from "../../../api/airtableService";

const LineNotificationCreatePage = () => {
  const router = useRouter();
  const [config, setConfig] = useState({
    name: "",
    headerTemplate: "วันนี้ %s %s มีจัดส่ง %d กล่อง",
    enableBubbles: true,
    bubbleFields: [],
    notificationTimes: ["08:00"],
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

  // Fetch available tables, groups, etc.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch tables
        const tablesData = await fetchAirtableTables();
        setTableOptions(tablesData.map(table => ({
          id: table.airtable_id,
          name: table.name
        })));
        
        // Fetch LINE groups
        const groupsData = await fetchLineGroups();
        setGroupOptions(groupsData.map(group => ({
          id: group.id,
          name: group.name
        })));
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlert({
          type: "error",
          message: "Failed to load configuration data"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // When tableID changes, fetch available views
  useEffect(() => {
    const fetchViews = async () => {
      if (!config.tableID) return;
      
      try {
        const data = await fetchAirtableRecordsFromView(config.tableID, "");
        // Extract unique view names if available in the response
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
      } catch (error) {
        console.error("Error fetching views:", error);
      }
    };
    
    fetchViews();
  }, [config.tableID]);

  const handleSaveConfig = async () => {
    // Validate form
    if (!config.name) {
      setAlert({
        type: "error",
        message: "Please enter a name for this notification"
      });
      return;
    }
    
    if (!config.tableID || !config.viewName) {
      setAlert({
        type: "error",
        message: "Please select both a table and view"
      });
      return;
    }
    
    if (config.groupIDs.length === 0) {
      setAlert({
        type: "error",
        message: "Please select at least one LINE group"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Create the request body
      const requestBody = {
        name: config.name,
        table_id: config.tableID,
        view_name: config.viewName,
        header_template: config.headerTemplate,
        enable_bubbles: config.enableBubbles,
        fields: config.bubbleFields,
        notification_times: config.notificationTimes,
        group_ids: config.groupIDs
      };
      
      const response = await createNotificationConfig(requestBody);
      
      setAlert({
        type: "success",
        message: "Notification settings created successfully"
      });
      
      // Navigate back to the list after a brief delay
      setTimeout(() => {
        router.push("/settings/linenotification");
      }, 1500);
    } catch (error) {
      console.error("Error creating notification settings:", error);
      setAlert({
        type: "error",
        message: error.message || "Failed to create notification settings"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestNotification = async () => {
    if (!config.tableID || !config.viewName) {
      setAlert({
        type: "error",
        message: "Please select both a table and view"
      });
      return;
    }
    
    if (config.groupIDs.length === 0) {
      setAlert({
        type: "error",
        message: "Please select at least one LINE group"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Create the request body for sending a test notification
      const requestBody = {
        table_id: config.tableID,
        view_name: config.viewName,
        fields: config.bubbleFields,
        group_ids: config.groupIDs,
        header_template: config.headerTemplate,
        enable_bubbles: config.enableBubbles
      };
      
      const response = await sendTestNotification(requestBody);
      
      setAlert({
        type: "success",
        message: `Test notification sent successfully! ${response.recordCount} records sent.`
      });
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
      headerTitle="Create LINE Notification"
      actionBar={
        <LineNotificationActionBar
          onSave={handleSaveConfig}
          onTest={handleTestNotification}
          isLoading={isLoading}
          isEdit={false}
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
        isEdit={false}
      />
    </SidebarLayout>
  );
};

export default LineNotificationCreatePage;