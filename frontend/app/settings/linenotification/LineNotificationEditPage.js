"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "../../../../components/layouts/SidebarLayout";
import LineNotificationActionBar from "../components/LineNotificationActionBar";
import LineNotificationForm from "../components/LineNotificationForm";
import Alert from "../../../../components/Alert";
import { 
  fetchNotificationConfig, 
  updateNotificationConfig, 
  fetchAirtableTables, 
  fetchAirtableRecordsFromView,
  fetchLineGroups 
} from "../../../api/airtableService";

const LineNotificationEditPage = ({ id }) => {
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

  // Fetch the notification config and available options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the notification config
        const notificationData = await fetchNotificationConfig(id);
        setConfig({
          id: notificationData.id,
          name: notificationData.name || "",
          headerTemplate: notificationData.header_template || "วันนี้ %s %s มีจัดส่ง %d กล่อง",
          enableBubbles: notificationData.enable_bubbles || true,
          bubbleFields: notificationData.fields || [],
          notificationTimes: notificationData.notification_times || ["08:00"],
          groupIDs: notificationData.group_ids || [],
          tableID: notificationData.table_id || "",
          viewName: notificationData.view_name || "",
        });
        
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
        
        // If the notification has a table and view, fetch fields
        if (notificationData.table_id && notificationData.view_name) {
          const recordsData = await fetchAirtableRecordsFromView(
            notificationData.table_id, 
            notificationData.view_name
          );
          
          if (recordsData.length > 0) {
            const firstRecord = recordsData[0];
            const fields = Object.keys(firstRecord.fields || {});
            setFieldOptions(fields.map(field => ({
              id: field,
              name: field
            })));
          }
        }
      } catch (error) {
        console.error("Error fetching notification data:", error);
        setAlert({
          type: "error",
          message: "Failed to load notification settings"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  // When tableID changes, fetch available views
  useEffect(() => {
    const fetchViews = async () => {
      if (!config.tableID) return;
      
      try {
        const data = await fetchAirtableRecordsFromView(config.tableID, "");
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
      } catch (error) {
        console.error("Error fetching views:", error);
      }
    };
    
    fetchViews();
  }, [config.tableID]);

  const handleSaveConfig = async () => {
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
        id: config.id,
        name: config.name,
        table_id: config.tableID,
        view_name: config.viewName,
        header_template: config.headerTemplate,
        enable_bubbles: config.enableBubbles,
        fields: config.bubbleFields,
        notification_times: config.notificationTimes,
        group_ids: config.groupIDs
      };
      
      await updateNotificationConfig(config.id, requestBody);
      
      setAlert({
        type: "success",
        message: "Notification settings updated successfully"
      });
      
      // Navigate back to the list after a brief delay
      setTimeout(() => {
        router.push("/settings/linenotification");
      }, 1500);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      setAlert({
        type: "error",
        message: error.message || "Failed to update notification settings"
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
      headerTitle={`Edit LINE Notification: ${config.name || 'Loading...'}`}
      actionBar={
        <LineNotificationActionBar
          onSave={handleSaveConfig}
          onTest={handleTestNotification}
          isLoading={isLoading}
          isEdit={true}
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
      
      {isLoading && !config.id ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <LineNotificationForm
          config={config}
          setConfig={setConfig}
          tableOptions={tableOptions}
          viewOptions={viewOptions}
          groupOptions={groupOptions}
          fieldOptions={fieldOptions}
          isEdit={true}
        />
      )}
    </SidebarLayout>
  );
};

export default LineNotificationEditPage;