const LINE_API_URL = process.env.NEXT_PUBLIC_LINE_CONNECT_URL;

/**
 * Fetch all registered LINE groups
 */
export const fetchLineGroups = async () => {
  const url = `${LINE_API_URL}/api/line/groups`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE groups fetch failed: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching LINE groups:", error);
    throw error;
  }
};

/**
 * Delete a LINE group by ID
 */
export const deleteLineGroup = async (groupId) => {
  const url = `${LINE_API_URL}/api/line/groups/${groupId}`;
  try {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE group deletion failed: ${errorText}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting LINE group:", error);
    throw error;
  }
};

/**
 * Register a new LINE group
 */
export const registerLineGroup = async (groupId, groupName, description = '') => {
  const url = `${LINE_API_URL}/api/line/groups`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: groupId, name: groupName, description }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LINE group registration failed: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error registering LINE group:", error);
    throw error;
  }
};

/**
 * Fetch all unregistered LINE groups that were detected
 */
export const fetchUnregisteredGroups = async () => {
  const url = `${process.env.NEXT_PUBLIC_LINE_CONNECT_URL}/api/line/detected-groups`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // ถ้า endpoint ไม่พร้อมใช้งาน (เช่น 404) ให้คืนค่าเป็นอาร์เรย์ว่าง
      if (response.status === 404) {
        console.warn('Detected groups endpoint not found, returning empty array');
        return [];
      }
      const errorText = await response.text();
      throw new Error(`Unregistered groups fetch failed: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching unregistered LINE groups:", error);
    // คืนค่าอาร์เรย์ว่างเมื่อเกิดข้อผิดพลาด
    return [];
  }
};

/**
 * Fetch recent messages for a specific LINE group
 */
export const fetchRecentMessages = async (groupId, limit = 5) => {
  const url = `${process.env.NEXT_PUBLIC_LINE_CONNECT_URL}/api/line/groups/${groupId}/messages?limit=${limit}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch recent messages: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching recent messages:", error);
    throw error;
  }
};

const handleViewMessages = async (groupId) => {
  if (recentMessages[groupId]) {
    // ถ้าเคยโหลดแล้ว ให้แสดงข้อมูลจาก state
    setShowMessages(groupId);
  } else {
    try {
      setIsLoading(true);
      const messages = await fetchRecentMessages(groupId);
      setRecentMessages(prev => ({ ...prev, [groupId]: messages }));
      setShowMessages(groupId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setAlert({
        type: "error",
        message: "Failed to load recent messages"
      });
    } finally {
      setIsLoading(false);
    }
  }
};

const closeMessages = () => {
  setShowMessages(null);
};
