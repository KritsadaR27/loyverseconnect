// /app/playground/jigsaw/components/fetchData.js
export default async function fetchData(search = "") {
    try {
        const res = await fetch(`http://localhost:3000/api/hi?search=${encodeURIComponent(search)}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}