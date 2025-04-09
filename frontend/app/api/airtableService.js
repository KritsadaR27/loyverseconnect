// frontend/app/api/airtableService.js

/**
 * Fetch data from AirtableConnect API
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Parsed JSON response
 */
export const fetchFromAirtableConnect = async (endpoint, options = {}) => {
    const apiUrl = process.env.NEXT_PUBLIC_AIRTABLE_CONNECT_URL || 'http://localhost:8086';
    const url = `${apiUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  };
  
  /**
   * Fetch available Airtable tables
   */
  export const fetchAirtableTables = async () => {
    return fetchFromAirtableConnect('/api/airtable/tables');
  };
  
  /**
   * Fetch records from a specific Airtable view
   * 
   * @param {string} tableId - Airtable table ID
   * @param {string} viewName - Name of the view
   */
  export const fetchAirtableRecordsFromView = async (tableId, viewName) => {
    let url = `/api/airtable/records?table_id=${tableId}`;
    if (viewName) {
      url += `&view_name=${encodeURIComponent(viewName)}`;
    }
    return fetchFromAirtableConnect(url);
  };
  
  /**
   * Fetch available LINE groups
   */
  export const fetchLineGroups = async () => {
    return fetchFromAirtableConnect('/api/line/groups');
  };
  
  /**
   * Fetch all notification configurations
   */
  export const fetchNotificationConfigs = async () => {
    return fetchFromAirtableConnect('/api/airtable/notify/configs');
  };
  
  /**
   * Fetch a specific notification configuration
   * 
   * @param {string|number} id - Notification configuration ID
   */
  export const fetchNotificationConfig = async (id) => {
    return fetchFromAirtableConnect(`/api/airtable/notify/configs/${id}`);
  };
  
  /**
   * Create a new notification configuration
   * 
   * @param {Object} config - Notification configuration object
   */
  export const createNotificationConfig = async (config) => {
    return fetchFromAirtableConnect('/api/airtable/notify/configs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
  };
  
  /**
   * Update an existing notification configuration
   * 
   * @param {string|number} id - Notification configuration ID
   * @param {Object} config - Updated notification configuration
   */
  export const updateNotificationConfig = async (id, config) => {
    return fetchFromAirtableConnect(`/api/airtable/notify/configs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
  };
  
  /**
   * Delete a notification configuration
   * 
   * @param {string|number} id - Notification configuration ID
   */
  export const deleteNotificationConfig = async (id) => {
    return fetchFromAirtableConnect(`/api/airtable/notify/configs/${id}`, {
      method: 'DELETE',
    });
  };
  
  /**
   * Send a test notification using the specified configuration
   * 
   * @param {Object} notificationData - Test notification configuration
   */
  export const sendTestNotification = async (notificationData) => {
    return fetchFromAirtableConnect('/api/airtable/notify/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
  };
  
  /**
   * Trigger a notification to run now
   * 
   * @param {string|number} id - Notification configuration ID
   */
  export const runNotificationNow = async (id) => {
    return fetchFromAirtableConnect(`/api/airtable/notify/configs/${id}/run`, {
      method: 'POST',
    });
  };