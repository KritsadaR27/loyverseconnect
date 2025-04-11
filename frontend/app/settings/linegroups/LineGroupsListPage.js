"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BellIcon
} from "@heroicons/react/24/outline";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import Alert from "../../../components/Alert";
import { 
  fetchLineGroups, 
  deleteLineGroup, 
  registerLineGroup, 
  fetchUnregisteredGroups, 
  fetchRecentMessages 
} from "../../api/lineService";

const LineGroupsListPage = () => {
  const router = useRouter();
  const [groups, setGroups] = useState([]);  
  const [unregisteredGroups, setUnregisteredGroups] = useState([]);  
  const [isLoading, setIsLoading] = useState(true);  
  const [alert, setAlert] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [registerForm, setRegisterForm] = useState(null);
  const [recentMessages, setRecentMessages] = useState({});
  const [showMessages, setShowMessages] = useState(null);

  // Fetch all LINE groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setIsLoading(true);

        // Fetch registered groups
        const data = await fetchLineGroups();
        setGroups(data || []);  

        // Fetch unregistered groups
        const unregisteredData = await fetchUnregisteredGroups();
        setUnregisteredGroups(unregisteredData || []);  
      } catch (error) {
        console.error("Error loading groups:", error);
        setAlert({
          type: "error",
          message: "Failed to load LINE groups",
        });
        setGroups([]);  
        setUnregisteredGroups([]);  
      } finally {
        setIsLoading(false);
      }
    };

    loadGroups();
  }, []);

  const handleCreateNew = () => {
    setRegisterForm({
      id: "",
      name: "",
      description: ""
    });
  };

  const handleEdit = (group) => {
    setRegisterForm({
      id: group.id,
      name: group.name,
      description: group.description || ""
    });
  };

  const confirmDelete = (group) => {
    setDeleteConfirmation(group);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      setIsLoading(true);
      await deleteLineGroup(deleteConfirmation.id);
      setGroups(groups.filter((g) => g.id !== deleteConfirmation.id));
      setAlert({
        type: "success",
        message: "LINE group deleted successfully",
      });
      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Error deleting group:", error);
      setAlert({
        type: "error",
        message: "Failed to delete LINE group",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterGroup = async (groupId, groupName) => {
    try {
      setIsLoading(true);
      const newGroup = await registerLineGroup(groupId, groupName);
      setGroups([...groups, newGroup]);
      setUnregisteredGroups(unregisteredGroups.filter((g) => g.id !== groupId));
      setAlert({
        type: "success",
        message: "LINE group registered successfully",
      });
    } catch (error) {
      console.error("Error registering group:", error);
      setAlert({
        type: "error",
        message: "Failed to register LINE group",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    
    if (!registerForm.name) {
      setAlert({
        type: "error",
        message: "Group name is required"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const method = registerForm.id && groups.some(g => g.id === registerForm.id) ? 'PUT' : 'POST';
      const url = method === 'PUT' ? `/api/line/groups/${registerForm.id}` : '/api/line/groups';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: registerForm.id,
          name: registerForm.name,
          description: registerForm.description
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const savedGroup = await response.json();
      
      if (method === 'PUT') {
        setGroups(groups.map(g => g.id === savedGroup.id ? savedGroup : g));
      } else {
        setGroups([...groups, savedGroup]);
      }
      
      setAlert({
        type: "success",
        message: `LINE group ${method === 'PUT' ? 'updated' : 'created'} successfully`
      });
      
      setRegisterForm(null);
    } catch (error) {
      console.error("Error saving group:", error);
      setAlert({
        type: "error",
        message: `Failed to ${registerForm.id ? 'update' : 'create'} LINE group`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelForm = () => {
    setRegisterForm(null);
  };

  const handleViewMessages = async (groupId) => {
    if (recentMessages[groupId]) {
      setShowMessages(groupId);
    } else {
      try {
        setIsLoading(true);
        const messages = await fetchRecentMessages(groupId); // เรียก API
        console.log("Fetched messages:", messages); // เพิ่ม log เพื่อตรวจสอบข้อมูล
        setRecentMessages((prev) => ({ ...prev, [groupId]: messages }));
        setShowMessages(groupId);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setAlert({
          type: "error",
          message: "Failed to load recent messages",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const closeMessages = () => {
    setShowMessages(null);
  };

  const ActionBar = () => (
    <div className="flex items-center justify-between py-1.5 rounded-md">
      <button
        onClick={handleCreateNew}
        className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Add New LINE Group
      </button>
    </div>
  );

  return (
    <SidebarLayout headerTitle="LINE Groups" actionBar={<ActionBar />}>
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
          <div className="bg-white  rounded-lg shadow-lg max-w-md mx-auto">
            <div className="flex items-center text-red-600 mb-4">
              <ExclamationCircleIcon className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            <p className="mb-4">
              Are you sure you want to delete the LINE group "{deleteConfirmation.name}"? This action cannot be undone.
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

      {/* Register/Edit Group Form */}
      {registerForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full">
            <h3 className="text-lg font-semibold mb-4">
              {registerForm.id && groups.some(g => g.id === registerForm.id) ? 'Edit' : 'Add'} LINE Group
            </h3>
            <form onSubmit={handleSaveGroup}>
              <div className="mb-4">
                <label htmlFor="group-id" className="block text-sm font-medium text-gray-700 mb-1">
                  Group ID
                </label>
                <input
                  id="group-id"
                  type="text"
                  value={registerForm.id}
                  onChange={(e) => setRegisterForm({...registerForm, id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter LINE group ID"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter a display name for this group"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="group-desc" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="group-desc"
                  value={registerForm.description}
                  onChange={(e) => setRegisterForm({...registerForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter a description for this group"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Messages Modal */}
      {showMessages && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Recent Messages - {groups.find(g => g.id === showMessages)?.name}
              </h3>
              <button onClick={closeMessages} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentMessages[showMessages]?.length > 0 ? (
                recentMessages[showMessages].map((msg, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{msg.sender || "Unknown Sender"}</span> {/* ตรวจสอบ sender */}
                      <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "Unknown Time"}</span> {/* ตรวจสอบ timestamp */}
                    </div>
                    <p className="text-gray-800 text-sm">{msg.content || "No Content"}</p> {/* ตรวจสอบ content */}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent messages found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        {isLoading && groups.length === 0 ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Unregistered Groups Section */}
            {(unregisteredGroups || []).length > 0 && (
              <div className="mb-8">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        We found {unregisteredGroups.length} new LINE group(s) that can be registered.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-lg font-semibold mb-2">Unregistered LINE Groups</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unregisteredGroups.map((group) => (
                        <tr key={group.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {group.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <input
                              type="text"
                              placeholder="Enter group name"
                              className="border border-gray-300 rounded px-2 py-1 mr-2"
                              onChange={(e) => group.tempName = e.target.value}
                            />
                            <button
                              onClick={() => handleRegisterGroup(group.id, group.tempName)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                              disabled={!group.tempName}
                            >
                              Register
                            </button>
                            <button
                              onClick={() => handleViewMessages(group.id)} // ปุ่มสำหรับดูข้อความล่าสุด
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 ml-2"
                            >
                              View Messages
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Registered Groups Section */}
            <h2 className="text-lg font-semibold mb-2">Registered LINE Groups</h2>
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BellIcon className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-500 mb-4">No LINE groups registered yet</p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Register your first LINE group
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{group.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {group.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {group.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleViewMessages(group.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Recent Messages"
                              disabled={isLoading}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(group)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                              disabled={isLoading}
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(group)}
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
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default LineGroupsListPage;