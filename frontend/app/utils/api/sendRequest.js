const defaultTimeout = 15000;

export const sendRequest = async (url, options = {}, timeout = defaultTimeout, retries = 3) => {
    const controller = new AbortController();
    const { signal } = controller;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { ...options, signal });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === "AbortError") {
            console.error("Request timed out");
        } else {
            console.error("Request error:", error);
        }

        if (retries > 0) {
            console.warn(`Retrying... (${3 - retries} attempts left)`);
            return sendRequest(url, options, timeout, retries - 1);
        }

        return { success: false, message: error.message };
    } finally {
        clearTimeout(timeoutId);
    }
};
