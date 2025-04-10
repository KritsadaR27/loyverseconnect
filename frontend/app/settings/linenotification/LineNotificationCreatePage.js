"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import LineNotificationActionBar from "./components/LineNotificationActionBar";
import LineNotificationForm from "./components/LineNotificationForm";
import Alert from "../../../components/Alert";
import { 
  createNotificationConfig, 
  fetchAirtableTables, 
  fetchAirtableRecordsFromView,
  fetchViewsByTable,
  sendTestNotification,
  sendBubbleNotification
} from "../../api/airtableService";
import { fetchLineGroups } from '../../api/lineService';

const LineNotificationCreatePage = () => {
  const router = useRouter();
  const [config, setConfig] = useState({
    name: "",
    // Default templates
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
    schedule: "0 8 * * *"
  });
  
  const [tableOptions, setTableOptions] = useState([]);
  const [viewOptions, setViewOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
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
 
  // Fetch available tables, groups, etc.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch tables
        const tablesData = await fetchAirtableTables();

        if (Array.isArray(tablesData)) {
          setTableOptions(tablesData.map(table => ({
            id: table.airtable_id,
            name: table.name
          })));
        } else {
          throw new Error("Invalid response: expected array from fetchAirtableTables");
        }
        
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
        setIsLoading(true);
        const data = await fetchViewsByTable(config.tableID);
  
        const views = data.views || [];
        setViewOptions(views.map(view => ({
          id: view.name,  
          name: view.name
        })));
  
        // Reset field options when table changes
        setFieldOptions([]);
        setConfig(prev => ({ ...prev, viewName: "" }));
      } catch (error) {
        console.error("Error fetching views:", error);
        setAlert({ type: "error", message: "Failed to fetch views" });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchViews();
  }, [config.tableID]);

  // When viewName changes, fetch available fields
  useEffect(() => {
    const fetchFields = async () => {
      if (!config.tableID || !config.viewName) return;
  
      try {
        const records = await fetchAirtableRecordsFromView(config.tableID, config.viewName);
        const sampleFields = records?.[0]?.fields || {};
        setFieldOptions(Object.keys(sampleFields).map(key => ({
          id: key,
          name: key
        })));
      } catch (error) {
        console.error("Error fetching fields:", error);
        setAlert({ type: "error", message: "Failed to fetch fields" });
      }
    };
  
    fetchFields();
  }, [config.tableID, config.viewName]);
  
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
      // Create the request body
      const requestBody = {
        name: config.name,
        table_id: config.tableID,
        view_name: config.viewName,
        header_template: config.headerTemplate,
        bubble_template: config.bubbleTemplate,
        footer_template: config.footerTemplate,
        enable_bubbles: config.enableBubbles,
        message_template: config.messageTemplate || "",
        fields: config.fields,
        notification_times: config.notificationTimes,
        group_ids: config.groupIDs,
        schedule: config.schedule,
        active: config.active
      };
      
      await createNotificationConfig(requestBody);

      setAlert({ type: "success", message: "Notification settings created successfully" });
      setTimeout(() => router.push("/settings/linenotification"), 1500);
    } catch (error) {
      console.error("Error:", error);
      setAlert({ type: "error", message: error.message || "Failed to create notification settings" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestNotification = async () => {
    setValidationErrors(computedValidationErrors);
    if (!isFormValid) {
      setAlert({ type: "error", message: "Please fix validation errors before testing" });
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
        header_template: config.headerTemplate,
        bubble_template: config.bubbleTemplate,
        footer_template: config.footerTemplate
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
      headerTitle="Create LINE Notification"
      actionBar={
        <LineNotificationActionBar
          onSave={handleSaveConfig}
          onTest={handleTestNotification}
          isLoading={isLoading}
          isEdit={false}
          formValid={isFormValid}
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
        validationErrors={validationErrors}
        isEdit={false}
      />
    </SidebarLayout>
  );
};

export default LineNotificationCreatePage;