// app/po/stores/poStore.js
import create from 'zustand';

export const usePOStore = create((set) => ({
    selectedPOs: [],
    setSelectedPOs: (ids) => set({ selectedPOs: ids }),
    bulkDelete: async (ids) => {
        // API call เพื่อลบ PO ที่เลือก
        await axios.delete('/api/purchase_orders', { data: { ids } });
        alert('Selected POs deleted successfully!');
    },
    bulkDownload: (ids, poList) => {
        // Export ข้อมูลที่เลือกเป็น CSV
        const selectedData = poList.filter(po => ids.includes(po.id));
        const csvContent = "data:text/csv;charset=utf-8," 
            + selectedData.map(po => `${po.id},${po.item_name},${po.total_stock},${po.supplier_name},${po.order_date},${po.status},${po.updated_by}`)
                .join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "purchase_orders.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}));
