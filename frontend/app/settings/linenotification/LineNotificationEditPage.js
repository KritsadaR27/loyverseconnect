"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import LineNotificationActionBar from "./components/LineNotificationActionBar";
import LineNotificationForm from "../../../components/linenotifications/LineNotificationForm";
import Alert from "../../../components/Alert";
import { 
  fetchNotificationConfig, 
  updateNotificationConfig, 
  deleteNotificationConfig,
  fetchAirtableTables, 
  fetchAirtableRecordsFromView,

  sendTestNotification,
  sendBubbleNotification
} from "../../api/airtableService";
import { fetchLineGroups } from '../../api/lineService';

const LineNotificationEditPage = ({ id }) => {
  const router = useRouter();
  const [config, setConfig] = useState({
    name: "",
    headerTemplate: "วันนี้ %s %s มีจัดส่ง %d กล่อง",
    enableBubbles: true,
    fields: [],
    notificationTimes: ["08:00"],
    groupIDs: [],
    tableID: "",
    viewName: "",
    active: true,
    schedule: "0 8 * * *"
  });
  
  const [tableOptions, setTableOptions] = useState([]);
  const [viewOptions, setViewOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    // Basic validation
    const errors = {};
    
    if (!config.name || config.name.trim() === '') {
      errors.name = 'Notification name is required';
    }
    
    if (!config.tableID) {
      errors.tableID = 'Airtable selection is required';
    }
    
    if (!config.viewName) {
      errors.viewName = 'View selection is required'; 
    }
    
    if (!config.fields || config.fields.length === 0) {
      errors.fields = 'At least one field must be selected';
    }
    
    if (!config.enableBubbles && (!config.messageTemplate || config.messageTemplate.trim() === '')) {
      errors.messageTemplate = 'Message template is required for non-bubble notifications';
    }
    
    if (!config.groupIDs || config.groupIDs.length === 0) {
      errors.groupIDs = 'At least one LINE group must be selected';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch the notification config and available options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the notification config
        const notificationData = await fetchNotificationConfig(id);
        
        // Map API response to our config state
        setConfig({
          id: notificationData.id,
          name: notificationData.name || "",
          headerTemplate: notificationData.header_template || "วันนี้ %s %s มีจัดส่ง %d กล่อง",
          enableBubbles: notificationData.enable_bubbles || true,
          fields: notificationData.fields || [],
          messageTemplate: notificationData.message_template || "",
          notificationTimes: notificationData.notification_times || ["08:00"],
          groupIDs: notificationData.group_ids || [],
          tableID: notificationData.table_id || "",
          viewName: notificationData.view_name || "",
          schedule: notificationData.schedule || "0 8 * * *",
          active: notificationData.active !== undefined ? notificationData.active : true
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
          
          if (Array.isArray(recordsData) && recordsData.length > 0) {
            const firstRecord = recordsData[0];
            const fields = Object.keys(firstRecord.fields || {});
            setFieldOptions(fields.map(field => ({
              id: field,
              name: field
            })));
          }
          
          // Extract unique view names if available in the response
          const views = Array.isArray(recordsData) && recordsData.length > 0 
            ? [...new Set(recordsData.map(record => record.view_name).filter(Boolean))]
            : [];
            
          setViewOptions(views.map(view => ({
            id: view,
            name: view
          })));
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
        setIsLoading(true);
        const data = await fetchAirtableRecordsFromView(config.tableID, "");
        
        // Extract unique view names if available in the response
        const views = Array.isArray(data) && data.length > 0 
          ? [...new Set(data.map(record => record.view_name).filter(Boolean))]
          : [];
          
        setViewOptions(views.map(view => ({
          id: view,
          name: view
        })));
        
        // Extract field names from the first record
        if (Array.isArray(data) && data.length > 0) {
          const firstRecord = data[0];
          const fields = Object.keys(firstRecord.fields || {});
          setFieldOptions(fields.map(field => ({
            id: field,
            name: field
          })));
        }
      } catch (error) {
        console.error("Error fetching views:", error);
        setAlert({
          type: "error",
          message: "Failed to fetch views and fields"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchViews();
  }, [config.tableID]);

  const handleSaveConfig = async () => {
    if (!isFormValid()) {
      setAlert({
        type: "error",
        message: "Please fix validation errors before saving"
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
        message_template: config.messageTemplate || "",
        fields: config.fields,
        notification_times: config.notificationTimes,
        group_ids: config.groupIDs,
        schedule: config.schedule,
        active: config.active
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
  
  const handleDeleteConfig = async () => {
    setIsLoading(true);
    try {
      await deleteNotificationConfig(config.id);
      
      setAlert({
        type: "success",
        message: "Notification deleted successfully"
      });
      
      // Navigate back to the list after a brief delay
      setTimeout(() => {
        router.push("/settings/linenotification");
      }, 1500);
    } catch (error) {
      console.error("Error deleting notification:", error);
      setAlert({
        type: "error",
        message: error.message || "Failed to delete notification"
      });
    } finally {
      setShowDeleteConfirm(false);
      setIsLoading(false);
    }
  };
  
  const handleTestNotification = async () => {
    if (!isFormValid()) {
      setAlert({
        type: "error",
        message: "Please fix validation errors before testing"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Create the request body for sending a test notification
      const requestBody = {
        table_id: config.tableID,
        view_name: config.viewName,
        fields: config.fields,
        group_ids: config.groupIDs,
        enable_bubbles: config.enableBubbles,
        message_template: config.messageTemplate || "",
        header_template: config.headerTemplate
      };
      
      let response;
      if (config.enableBubbles) {
        response = await sendBubbleNotification(requestBody);
      } else {
        response = await sendTestNotification(requestBody);
      }
      
      setAlert({
        type: "success",
        message: `Test notification sent successfully! ${response.records_sent || response.recordCount || 0} records sent.`
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
          onDelete={() => setShowDeleteConfirm(true)}
          isLoading={isLoading}
          isEdit={true}
          formValid={isFormValid()}
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete the notification "{config.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfig}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
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
          validationErrors={validationErrors}
          isEdit={true}
        />
      )}
    </SidebarLayout>
  );
};

export default LineNotificationEditPage;