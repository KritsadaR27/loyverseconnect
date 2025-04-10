"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import LineNotificationActionBar from "./components/LineNotificationActionBar";
import LineNotificationForm from "./components/LineNotificationForm";
import Alert from "../../../components/Alert";
import {
  fetchNotificationConfig,
  updateNotificationConfig,
  fetchAirtableTables,
  fetchAirtableRecordsFromView,
  fetchViewsByTable,
  sendTestNotification,
  sendBubbleNotification,
  runNotificationNow
} from "../../api/airtableService";
import { fetchLineGroups } from "../../api/lineService";

const LineNotificationEditPage = ({ id }) => {
  const router = useRouter();
  const [config, setConfig] = useState({
    name: "",
    headerTemplate: "วันนี้ {{.Weekday}} {{.Date}} มีจัดส่ง {{.Count}} กล่อง",
    bubbleTemplate: "• กล่องที่ {{.Index}}\n{{if .OrderName}}{{.OrderName}}\n{{end}}{{if .CustomerName}}ชื่อลูกค้า: {{.CustomerName}}\n{{end}}{{if .PhoneNumber}}เบอร์โทร: {{.PhoneNumber}}{{end}}",
    footerTemplate: "ขอให้มีความสุขในการจัดส่ง 🙏",
    enableBubbles: true,
    fields: [],
    notificationTimes: ["08:00"],
    groupIDs: [],
    tableID: "",
    viewName: "",
    active: true,
    schedule: "0 8 * * *",
  });

  const [tableOptions, setTableOptions] = useState([]);
  const [viewOptions, setViewOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Form validation
  const computedValidationErrors = useMemo(() => {
    const errors = {};
    if (!config.name?.trim()) errors.name = "Notification name is required";
    if (!config.tableID) errors.tableID = "Airtable selection is required";
    if (!config.viewName) errors.viewName = "View selection is required";
    if (!config.fields?.length) errors.fields = "At least one field must be selected";
    if (!config.enableBubbles && !config.messageTemplate?.trim())
      errors.messageTemplate = "Message template is required";
    if (!config.groupIDs?.length) errors.groupIDs = "At least one LINE group must be selected";
    return errors;
  }, [config]);
  
  const isFormValid = useMemo(() => Object.keys(computedValidationErrors).length === 0, [computedValidationErrors]);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Load table options and group options
        const [tablesData, groupsData] = await Promise.all([
          fetchAirtableTables(),
          fetchLineGroups()
        ]);

        setTableOptions(tablesData.map((table) => ({ 
          id: table.airtable_id, 
          name: table.name 
        })));

        setGroupOptions(groupsData.map((group) => ({ 
          id: group.id, 
          name: group.name 
        })));

        // Load notification configuration if ID is provided
        if (id) {
          const notificationData = await fetchNotificationConfig(id);
          
          // Map backend field names to frontend config state
          const newConfig = {
            id: notificationData.id,
            name: notificationData.name || "",
            headerTemplate: notificationData.header_template || "วันนี้ {{.Weekday}} {{.Date}} มีจัดส่ง {{.Count}} กล่อง",
            bubbleTemplate: notificationData.bubble_template || "• กล่องที่ {{.Index}}\n{{if .OrderName}}{{.OrderName}}\n{{end}}{{if .CustomerName}}ชื่อลูกค้า: {{.CustomerName}}\n{{end}}{{if .PhoneNumber}}เบอร์โทร: {{.PhoneNumber}}{{end}}",
            footerTemplate: notificationData.footer_template || "ขอให้มีความสุขในการจัดส่ง 🙏",
            enableBubbles: notificationData.enable_bubbles ?? true,
            fields: notificationData.fields || [],
            messageTemplate: notificationData.message_template || "",
            notificationTimes: notificationData.notification_times || ["08:00"],
            groupIDs: notificationData.group_ids || [],
            tableID: notificationData.table_id || "",
            viewName: notificationData.view_name || "",
            schedule: notificationData.schedule || "0 8 * * *",
            active: notificationData.active ?? true,
          };
          
          setConfig(newConfig);
          
          // Load view options for the selected table
          if (newConfig.tableID) {
            const viewsData = await fetchViewsByTable(newConfig.tableID);
            const views = viewsData.views || [];
            setViewOptions(views.map((view) => ({
              id: view.name,
              name: view.name,
            })));
            
            // Load field options for the selected view
            if (newConfig.viewName) {
              const records = await fetchAirtableRecordsFromView(newConfig.tableID, newConfig.viewName);
              const sampleFields = records?.[0]?.fields || {};
              setFieldOptions(Object.keys(sampleFields).map((key) => ({ 
                id: key, 
                name: key 
              })));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlert({ type: "error", message: "Failed to load data" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Update views and fields when tableID or viewName changes
  useEffect(() => {
    const fetchViewsAndFields = async () => {
      if (!config.tableID) return;
  
      try {
        setIsLoading(true);
  
        // Fetch views
        const response = await fetchViewsByTable(config.tableID);
        const views = response.views || [];  
        setViewOptions(views.map((view) => ({
          id: view.name,
          name: view.name,
        })));
  
        // Only fetch fields if viewName exists
        if (config.viewName) {
          const records = await fetchAirtableRecordsFromView(config.tableID, config.viewName);
          const sampleFields = records?.[0]?.fields || {};
          setFieldOptions(Object.keys(sampleFields).map((key) => ({ 
            id: key, 
            name: key 
          })));
        }
      } catch (error) {
        console.error("Error fetching views/fields:", error);
        setAlert({ type: "error", message: "Failed to fetch views and fields" });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchViewsAndFields();
  }, [config.tableID, config.viewName]);
  
  // Save notification configuration
  const handleSaveConfig = async () => {
    setValidationErrors(computedValidationErrors);
    if (!isFormValid) {
      setAlert({
        type: "error",
        message: "Please fix validation errors before saving"
      });
      return;
    }
  
    setIsLoading(true);
    try {
      // Sanitize the templates to ensure they're valid for JSON
      const sanitizeBubbleTemplate = config.bubbleTemplate?.replace(/\r/g, '')?.trim() || "";
      
      const requestBody = {
        name: config.name,
        table_id: config.tableID,
        view_name: config.viewName,
        header_template: config.headerTemplate || "",
        bubble_template: sanitizeBubbleTemplate,
        footer_template: config.footerTemplate || "",
        enable_bubbles: config.enableBubbles,
        message_template: config.messageTemplate || "",
        fields: config.fields,
        notification_times: config.notificationTimes,
        group_ids: config.groupIDs,
        schedule: config.schedule,
        active: config.active,
      };
  
      console.log("Sanitized request body:", JSON.stringify(requestBody));
      
      await updateNotificationConfig(id, requestBody);
  
      setAlert({ type: "success", message: "Notification settings saved successfully" });
      setTimeout(() => router.push("/settings/linenotification"), 1500);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      setAlert({ type: "error", message: "Failed to save notification settings" });
    } finally {
      setIsLoading(false);
    }
  };
  // Handle running a notification immediately
  const handleRunNow = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const result = await runNotificationNow(id);
      setAlert({
        type: "success",
        message: `Notification sent successfully! ${result.records_sent || 0} records sent.`
      });
    } catch (error) {
      console.error("Error running notification:", error);
      setAlert({
        type: "error",
        message: error.message || "Failed to run notification"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test notification
  const handleTestNotification = async () => {
    setValidationErrors(computedValidationErrors);
    if (!isFormValid) {
      setAlert({ type: "error", message: "Please fix validation errors before testing" });
      return;
    }
  
    setIsLoading(true);
    try {
      const requestBody = {
        table_id: config.tableID,
        view_name: config.viewName,
        fields: config.fields,
        group_ids: config.groupIDs,
        enable_bubbles: config.enableBubbles,
        message_template: config.messageTemplate || "",
        header_template: config.headerTemplate,
        bubble_template: config.bubbleTemplate,
        footer_template: config.footerTemplate
      };
  
      const response = config.enableBubbles
        ? await sendBubbleNotification(requestBody)
        : await sendTestNotification(requestBody);
  
      setAlert({
        type: "success",
        message: `Test notification sent successfully! ${response.records_sent || response.recordCount || 0} records sent.`,
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      setAlert({
        type: "error",
        message: error.message || "Failed to send test notification",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification deletion
  const handleDelete = async () => {
    // Code for deleting notification would go here
    // This would typically be implemented in the action bar component
  };
  
  return (
    <SidebarLayout
      headerTitle={`Edit LINE Notification`}
      actionBar={
        <LineNotificationActionBar
          onSave={handleSaveConfig}
          onTest={handleTestNotification}
          onRun={handleRunNow}
          onDelete={handleDelete}
          isLoading={isLoading}
          isEdit={true}
          formValid={isFormValid}
        />
      }
    >
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
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