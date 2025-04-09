"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PlayIcon,
  ClockIcon 
} from "@heroicons/react/24/outline";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import Alert from "../../../components/Alert";
import { fetchNotificationConfigs, deleteNotificationConfig, runNotificationNow } from "../../api/airtableService";

const LineNotificationListPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Fetch all notification configs
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await fetchNotificationConfigs();
        setNotifications(data);
      } catch (error) {
        console.error("Error loading notifications:", error);
        setAlert({
          type: "error",
          message: "Failed to load notifications"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleCreateNew = () => {
    router.push("/settings/linenotification/create");
  };

  const handleEdit = (id) => {
    router.push(`/settings/linenotification/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotificationConfig(id);
        setNotifications(notifications.filter(n => n.id !== id));
        setAlert({
          type: "success",
          message: "Notification deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting notification:", error);
        setAlert({
          type: "error",
          message: "Failed to delete notification"
        });
      }
    }
  };

  const handleRunNow = async (id) => {
    try {
      setIsLoading(true);
      await runNotificationNow(id);
      setAlert({
        type: "success",
        message: "Notification triggered successfully"
      });
    } catch (error) {
      console.error("Error triggering notification:", error);
      setAlert({
        type: "error",
        message: "Failed to trigger notification"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatSchedule = (times) => {
    if (!times || times.length === 0) return "No schedule";
    return times.join(", ");
  };

  const ActionBar = () => (
    <div className="flex items-center justify-between py-1.5 rounded-md">
      <button
        onClick={handleCreateNew}
        className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Create New Notification
      </button>
    </div>
  );

  return (
    <SidebarLayout headerTitle="LINE Notifications" actionBar={<ActionBar />}>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No notifications found</p>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Create your first notification
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table/View</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bubbles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groups</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{notification.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{notification.table_name || notification.tableID}</div>
                      <div className="text-sm text-gray-500">{notification.view_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {formatSchedule(notification.notification_times)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.enable_bubbles ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {notification.enable_bubbles ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.group_ids?.length || 0} groups
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleRunNow(notification.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Run Now"
                      >
                        <PlayIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleEdit(notification.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default LineNotificationListPage;