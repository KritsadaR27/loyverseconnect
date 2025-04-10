/**
   * Fetch available LINE groups
   */
export const fetchLineGroups = async () => {
    const lineApiUrl = process.env.NEXT_PUBLIC_LINE_API_URL;
    const url = `${lineApiUrl}/api/line/groups`;
  
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
  