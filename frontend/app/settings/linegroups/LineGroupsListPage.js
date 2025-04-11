"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BellIcon,
  ChatBubbleLeftRightIcon
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
  const [groupNames, setGroupNames] = useState({}); // เพิ่ม state สำหรับเก็บชื่อกลุ่ม

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

  const handleRegisterGroup = async (groupId) => {
    const groupName = groupNames[groupId];
    
    if (!groupName) {
      setAlert({
        type: "error",
        message: "Group name is required",
      });
      return;
    }
    
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
        const messages = await fetchRecentMessages(groupId);
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

  const handleGroupNameChange = (groupId, name) => {
    setGroupNames({
      ...groupNames,
      [groupId]: name
    });
  };

  const ActionBar = () => (
    <div className="flex justify-end py-2 px-6">
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
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
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
                Recent Messages - {groups.find(g => g.id === showMessages)?.name || "Unregistered Group"}
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
                      <span>{msg.sender || "Unknown Sender"}</span>
                      <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "Unknown Time"}</span>
                    </div>
                    <p className="text-gray-800 text-sm">{msg.content || "No Content"}</p>
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

      <div className="mx-6">
        {isLoading && groups.length === 0 && unregisteredGroups.length === 0 ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Notification Area */}
            {unregisteredGroups.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 mt-6 rounded">
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
            )}

            {/* Unregistered Groups Section */}
            {unregisteredGroups.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Unregistered LINE Groups</h2>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="bg-blue-50 py-3 px-6">
                    <div className="grid grid-cols-2">
                      <div className="text-sm font-semibold text-gray-600">GROUP ID</div>
                      <div className="text-sm font-semibold text-gray-600">ACTIONS</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {unregisteredGroups.map((group) => (
                      <div key={group.id} className="grid grid-cols-2 py-4 px-6 items-center">
                        <div className="text-sm font-medium text-blue-600 truncate">
                          {group.id}
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Enter group name"
                            className="border border-gray-300 rounded px-3 py-2 text-sm w-40"
                            onChange={(e) => handleGroupNameChange(group.id, e.target.value)}
                            value={groupNames[group.id] || ""}
                          />
                          <button
                            onClick={() => handleRegisterGroup(group.id)}
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition"
                            disabled={!groupNames[group.id]}
                          >
                            Register
                          </button>
                          <button
                            onClick={() => handleViewMessages(group.id)}
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Registered Groups Section */}
            <div>
              <h2 className="text-xl font-bold mb-4">Registered LINE Groups</h2>
              {groups.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
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
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="bg-blue-50 py-3 px-6">
                    <div className="grid grid-cols-12">
                      <div className="col-span-2 text-sm font-semibold text-gray-600">NAME</div>
                      <div className="col-span-3 text-sm font-semibold text-gray-600">ID</div>
                      <div className="col-span-4 text-sm font-semibold text-gray-600">DESCRIPTION</div>
                      <div className="col-span-1 text-sm font-semibold text-gray-600">STATUS</div>
                      <div className="col-span-2 text-sm font-semibold text-gray-600">ACTIONS</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {groups.map((group) => (
                      <div key={group.id} className="grid grid-cols-12 py-4 px-6 items-center">
                        <div className="col-span-2 font-medium text-gray-900">{group.name}</div>
                        <div className="col-span-3 text-sm text-gray-500 truncate">{group.id}</div>
                        <div className="col-span-4 text-sm text-gray-500">{group.description || "-"}</div>
                        <div className="col-span-1">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <div className="col-span-2 flex space-x-3">
                          <button
                            onClick={() => handleViewMessages(group.id)}
                            className="text-blue-600 hover:text-blue-900 rounded-full p-1 hover:bg-blue-50"
                            title="View Recent Messages"
                          >
                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(group)}
                            className="text-indigo-600 hover:text-indigo-900 rounded-full p-1 hover:bg-blue-50"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => confirmDelete(group)}
                            className="text-red-600 hover:text-red-900 rounded-full p-1 hover:bg-blue-50"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {groups.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
                      Showing 1-{groups.length} of {groups.length} items
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default LineGroupsListPage;