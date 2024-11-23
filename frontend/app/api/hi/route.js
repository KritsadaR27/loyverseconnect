// /app/api/hi/route.js
export async function GET(request) {
    const categories = ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5", "Category 6", "Category 7", "Category 8", "Category 9", "Category 10"];
    const stores = ["Store 1", "Store 2", "Store 3", "Store 4", "Store 5", "Store 6", "Store 7", "Store 8", "Store 9"];
    const suppliers = ["Supplier 1", "Supplier 2", "Supplier 3", "Supplier 4", "Supplier 5", "Supplier 6", "Supplier 7", "Supplier 8", "Supplier 9", "Supplier 10", "Supplier 11", "Supplier 12", "Supplier 13", "Supplier 14"];

    const generateData = (num) => {
        const data = [];
        for (let i = 1; i <= num; i++) {
            data.push({
                id: i,
                name: `Item ${i}`,
                value: `${Math.floor(Math.random() * 1000)}`,
                category: categories[Math.floor(Math.random() * categories.length)],
                store: stores[Math.floor(Math.random() * stores.length)],
                supplier: suppliers[Math.floor(Math.random() * suppliers.length)]
            });
        }
        return data;
    };

    const data = generateData(2000);

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
    });
}

export async function GET_METADATA(request) {
    const categories = ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5", "Category 6", "Category 7", "Category 8", "Category 9", "Category 10"];
    const stores = ["Store 1", "Store 2", "Store 3", "Store 4", "Store 5", "Store 6", "Store 7", "Store 8", "Store 9"];
    const suppliers = ["Supplier 1", "Supplier 2", "Supplier 3", "Supplier 4", "Supplier 5", "Supplier 6", "Supplier 7", "Supplier 8", "Supplier 9", "Supplier 10", "Supplier 11", "Supplier 12", "Supplier 13", "Supplier 14"];

    const metadata = {
        categories,
        stores,
        suppliers
    };

    return new Response(JSON.stringify(metadata), {
        headers: { "Content-Type": "application/json" },
    });
}