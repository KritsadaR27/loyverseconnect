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
    return fetchFromAirtableConnect(`/api/airtable/records?table_id=${tableId}&view_name=${viewName}`);
  };
  
  /**
   * Fetch available LINE groups
   */
  export const fetchLineGroups = async () => {
    return fetchFromAirtableConnect('/api/line/groups');
  };
  
  /**
   * Save bubble notification settings
   * 
   * @param {Object} settings - Notification settings
   */
  export const saveNotificationSettings = async (settings) => {
    return fetchFromAirtableConnect('/api/airtable/notify/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
  };
  
  /**
   * Send a test bubble notification
   * 
   * @param {Object} notificationData - Data for the test notification
   */
  export const sendTestBubbleNotification = async (notificationData) => {
    return fetchFromAirtableConnect('/api/airtable/notify/bubbles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
  };