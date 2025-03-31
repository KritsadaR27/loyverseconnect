// mockData.js
export const mockItems = Array.from({ length: 100 }, (_, index) => ({
    item_id: index + 1,
    name: `Item ${index + 1}`,
    quantity: index % 10 + 1, // ใช้ค่าคงที่แทน
    price: (index % 100 + 1).toFixed(2), // ใช้ค่าคงที่แทน
    category: `Category ${index % 5 + 1}`, // เพิ่ม category
    datefilter: new Date(2023, index % 12, index % 28 + 1), // เพิ่ม datefilter
    datepicker: new Date(2023, index % 12, index % 28 + 1), // เพิ่ม datepicker
    boolean: index % 2 === 0, // เพิ่ม boolean
    link: `https://example.com/item${index + 1}`, // เพิ่ม link
    phone: `123-456-789${index % 10}`, // เพิ่ม phone
    location: `Location ${index + 1}`, // เพิ่ม location
}));

export const categories = [...new Set(mockItems.map(item => item.category))];