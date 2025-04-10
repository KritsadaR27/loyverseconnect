// frontend/app/api/airtableService.js

/**
 * Fetch data from AirtableConnect API
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Parsed JSON response
 */
export const fetchFromAirtableConnect = async (endpoint, options = {}) => {
    const ApiUrl = process.env.NEXT_PUBLIC_AIRTABLE_CONNECT_URL;
   
    
    const url = `${ApiUrl}${endpoint}`;
    
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
 * Fetch available views for a specific Airtable table
 *
 * @param {string} tableId - Airtable table ID (same as airtable_id from DB)
 */
export const fetchViewsByTable = async (tableId) => {
  if (!tableId) throw new Error("Missing tableId for fetching views");
  return fetchFromAirtableConnect(`/api/airtable/views?table_id=${encodeURIComponent(tableId)}`);
};

  

  
  /**
   * Fetch all notification configurations
   */
  export const fetchNotificationConfigs = async () => {
    return fetchFromAirtableConnect('/api/airtable/notifications');
  };
  
  /**
   * Fetch a specific notification configuration
   * 
   * @param {string|number} id - Notification configuration ID
   */
  export const fetchNotificationConfig = async (id) => {
    return fetchFromAirtableConnect(`/api/airtable/notifications/?id=${id}`);
  };
  
  /**
   * Create a new notification configuration
   * 
   * @param {Object} config - Notification configuration object
   */
  export const createNotificationConfig = async (config) => {
    return fetchFromAirtableConnect('/api/airtable/notifications', {
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
    return fetchFromAirtableConnect(`/api/airtable/notifications/?id=${id}`, {
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
    return fetchFromAirtableConnect(`/api/airtable/notifications/?id=${id}`, {
      method: 'DELETE',
    });
  };
  
  /**
   * Send a test notification using the specified configuration
   * 
   * @param {Object} notificationData - Test notification configuration
   */
  export const sendTestNotification = async (notificationData) => {
    return fetchFromAirtableConnect('/api/airtable/notify/line', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
  };
  
  /**
   * Send messages as bubbles
   * 
   * @param {Object} notificationData - Bubble notification configuration
   */
  export const sendBubbleNotification = async (notificationData) => {
    return fetchFromAirtableConnect('/api/airtable/notify/bubbles', {
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
    return fetchFromAirtableConnect(`/api/airtable/notifications/run?id=${id}`, {
      method: 'POST',
    });
  };