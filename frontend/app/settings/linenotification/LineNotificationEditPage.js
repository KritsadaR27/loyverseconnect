"use client";

import React, { useState, useEffect,useMemo } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import LineNotificationActionBar from "./components/LineNotificationActionBar";
import LineNotificationForm from "./components/LineNotificationForm";
import Alert from "../../../components/Alert";
import {
  fetchNotificationConfig,
  saveNotificationConfig,
  updateNotificationConfig,
  fetchAirtableTables,
  fetchAirtableRecordsFromView,
  fetchViewsByTable,
  sendTestNotification,
  sendBubbleNotification,
} from "../../api/airtableService";
import { fetchLineGroups } from "../../api/lineService";

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
    schedule: "0 8 * * *",
  });

  const [tableOptions, setTableOptions] = useState([]);
  const [viewOptions, setViewOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // ตรวจสอบความถูกต้องของฟอร์ม
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

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (id) {
          const notificationData = await fetchNotificationConfig(id);
          const newConfig = {
            id: notificationData.id,
            name: notificationData.name || "",
            headerTemplate: notificationData.header_template || "วันนี้ %s %s มีจัดส่ง %d กล่อง",
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

          // เปรียบเทียบก่อน setConfig
          if (JSON.stringify(config) !== JSON.stringify(newConfig)) {
            setConfig(newConfig);
          }
        }

        const tablesData = await fetchAirtableTables();
        setTableOptions(tablesData.map((table) => ({ id: table.airtable_id, name: table.name })));

        const groupsData = await fetchLineGroups();
        setGroupOptions(groupsData.map((group) => ({ id: group.id, name: group.name })));
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlert({ type: "error", message: "Failed to load data" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]); // Track only id

  // เมื่อ tableID เปลี่ยน ให้โหลด Views และ Fields ใหม่
  useEffect(() => {
    const fetchViewsAndFields = async () => {
      if (!config.tableID) return;
  
      try {
        setIsLoading(true);
  
        // Fetch views
        const response = await fetchViewsByTable(config.tableID);
        const views = response.views || [];  
        const newViewOptions = views.map((view) => ({
          id: view.view_id,
          name: view.name,
        }));
        setViewOptions((prev) =>
          JSON.stringify(prev) !== JSON.stringify(newViewOptions) ? newViewOptions : prev
        );
  
        // Fetch fields only if viewName exists
        if (config.viewName) {
          const records = await fetchAirtableRecordsFromView(config.tableID, config.viewName);
          const sampleFields = records?.[0]?.fields;
          const newFieldOptions = sampleFields && typeof sampleFields === "object"
            ? Object.keys(sampleFields).map((key) => ({ id: key, name: key }))
            : [];
  
          setFieldOptions((prev) =>
            JSON.stringify(prev) !== JSON.stringify(newFieldOptions) ? newFieldOptions : prev
          );
        } else {
          setFieldOptions([]); // clear
        }
      } catch (error) {
        console.error("Error fetching views/fields:", error);
        setAlert({ type: "error", message: "Failed to fetch views and fields" });
      } finally {
        setIsLoading(false);
      }
    };
  
    
    fetchViewsAndFields();
  }, [config.tableID, config.viewName]); // Track only tableID and viewName

  

  
  // บันทึกการตั้งค่า Notification
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
        active: config.active,
      };

      if (id) {
        await updateNotificationConfig(id, requestBody);
      } else {
        await saveNotificationConfig(requestBody);
      }

      setAlert({ type: "success", message: "Notification settings saved successfully" });
      setTimeout(() => router.push("/settings/linenotification"), 1500);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      setAlert({ type: "error", message: "Failed to save notification settings" });
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
      const requestBody = {
        table_id: config.tableID,
        view_name: config.viewName,
        fields: config.fields,
        group_ids: config.groupIDs,
        enable_bubbles: config.enableBubbles,
        message_template: config.messageTemplate || "",
        header_template: config.headerTemplate,
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
  
  return (
    <SidebarLayout
      headerTitle={`${id ? "Edit" : "Create"} LINE Notification`}
      actionBar={
        <LineNotificationActionBar
          onSave={handleSaveConfig}
          onTest={handleTestNotification} // ต้องมีบรรทัดนี้
          isLoading={isLoading}
          isEdit={!!id}
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
          isEdit={!!id}
        />
      )}
    </SidebarLayout>
  );
};

export default LineNotificationEditPage;