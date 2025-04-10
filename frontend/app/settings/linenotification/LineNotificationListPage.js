"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PlayIcon,
  ClockIcon,
  BellIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import Alert from "../../../components/Alert";
import { 
  fetchNotificationConfigs, 
  deleteNotificationConfig, 
  runNotificationNow 
} from "../../api/airtableService";

const LineNotificationListPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

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

  const confirmDelete = (notification) => {
    setDeleteConfirmation(notification);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) return;
    
    try {
      setIsLoading(true);
      await deleteNotificationConfig(deleteConfirmation.id);
      setNotifications(notifications.filter(n => n.id !== deleteConfirmation.id));
      setAlert({
        type: "success",
        message: "Notification deleted successfully"
      });
      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Error deleting notification:", error);
      setAlert({
        type: "error",
        message: "Failed to delete notification"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunNow = async (id) => {
    try {
      setIsLoading(true);
      const result = await runNotificationNow(id);
      setAlert({
        type: "success",
        message: `Notification triggered successfully - ${result.records_sent} records sent`
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatSchedule = (times) => {
    if (!times || times.length === 0) return "Not scheduled";
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <div className="flex items-center text-red-600 mb-4">
              <ExclamationCircleIcon className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            <p className="mb-4">
              Are you sure you want to delete the notification "{deleteConfirmation.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {isLoading && notifications.length === 0 ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellIcon className="h-8 w-8 text-gray-500" />
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{notification.name}</div>
                      <div className="text-sm text-gray-500">
                        {notification.enable_bubbles ? 
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Bubbles
                          </span> : 
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Single message
                          </span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{notification.table_id}</div>
                      <div className="text-sm text-gray-500">{notification.view_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {notification.schedule || "Manual only"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatSchedule(notification.notification_times)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(notification.last_run)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {notification.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRunNow(notification.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Run Now"
                          disabled={isLoading}
                        >
                          <PlayIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(notification.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                          disabled={isLoading}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(notification)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          disabled={isLoading}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
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