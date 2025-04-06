import { useState, useEffect, useRef } from "react";

const useInventoryActionBar = (setSelectedCategories, setSelectedSuppliers, toggleShowStoreStocks, setGroupBy, showFriendOrder, setShowFriendOrder, categories, suppliers) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showCategories, setShowCategories] = useState(false);
    const [showSuppliers, setShowSuppliers] = useState(false);
    const [showGroupBy, setShowGroupBy] = useState(false);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [categorySearchTerm, setCategorySearchTerm] = useState("");
    const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
    const [alert, setAlert] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const categoriesRef = useRef(null);
    const suppliersRef = useRef(null);
    const groupByRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
                setShowCategories(false);
            }
            if (suppliersRef.current && !suppliersRef.current.contains(event.target)) {
                setShowSuppliers(false);
            }
            if (groupByRef.current && !groupByRef.current.contains(event.target)) {
                setShowGroupBy(false);
            }
            if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowSearchInput(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCategoryChange = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
    };

    const handleSupplierChange = (supplier) => {
        setSelectedSuppliers((prev) =>
            prev.includes(supplier) ? prev.filter((s) => s !== supplier) : [...prev, supplier]
        );
    };

    const clearCategories = () => {
        setSelectedCategories([]);
    };

    const clearSuppliers = () => {
        setSelectedSuppliers([]);
    };

    const selectAllCategories = () => {
        setSelectedCategories(categories.map(category => category.name));
    };

    const selectAllSuppliers = () => {
        setSelectedSuppliers(suppliers.map(supplier => supplier.name));
    };

    const handleFriendOrderToggle = () => {
        const newShowFriendOrder = !showFriendOrder;
        setShowFriendOrder(newShowFriendOrder);
        toggleShowStoreStocks(true);
        setGroupBy(newShowFriendOrder ? 'supplier_name' : '');
        setSelectedSuppliers(newShowFriendOrder ? ["หมูลุงรวย", "จัมโบ้", "ลูกชิ้น", "อั่ว", "เนื้อริบอาย", "เนื้อโคขุน", "แหนมเล็ก", "แหนมใหญ่"] : []);
    };

    const handleFriendOrderCancel = () => {
        setShowFriendOrder(false);
        toggleShowStoreStocks(false);
        setGroupBy('');
        setSelectedSuppliers([]);
    };

    const handleSync = async (endpoint) => {
        setIsLoading(true);
        try {
            const response = await fetch(endpoint, { method: "POST" });
            if (response.ok) {
                setAlert({ message: `ซิงค์ข้อมูลสต๊อกเรียบร้อยแล้วจ้า`, type: 'success' });
            } else {
                setAlert({ message: `ซิงค์ไม่สำเร็จ กรุณาติดต่อคนทำ`, type: 'error' });
            }
        } catch (error) {
            setAlert({ message: "Error: Could not complete sync", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleGroupBy = () => {
        setShowGroupBy(!showGroupBy);
    };

    const toggleSearchInput = () => {
        setShowSearchInput(!showSearchInput);
    };

    return {
        searchTerm,
        setSearchTerm,
        showCategories,
        setShowCategories,
        showSuppliers,
        setShowSuppliers,
        showGroupBy,
        setShowGroupBy,
        showSearchInput,
        setShowSearchInput,
        categorySearchTerm,
        setCategorySearchTerm,
        supplierSearchTerm,
        setSupplierSearchTerm,
        alert,
        setAlert,
        isLoading,
        setIsLoading,
        categoriesRef,
        suppliersRef,
        groupByRef,
        searchInputRef,
        handleCategoryChange,
        handleSupplierChange,
        clearCategories,
        clearSuppliers,
        selectAllCategories,
        selectAllSuppliers,
        handleFriendOrderToggle,
        handleFriendOrderCancel,
        handleSync,
        toggleGroupBy,
        toggleSearchInput,
    };
};

export default useInventoryActionBar;
