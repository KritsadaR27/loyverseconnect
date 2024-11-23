// /app/playground/jigsaw/api/data/route.js
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const data = [
        { id: 1, name: "Item 1", value: "100" },
        { id: 2, name: "Item 2", value: "200" },
        { id: 3, name: "Searchable Item", value: "300" },
    ];

    const filteredData = search
        ? data.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        )
        : data;

    return new Response(JSON.stringify(filteredData), {
        headers: { "Content-Type": "application/json" },
    });
}
