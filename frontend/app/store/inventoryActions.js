import { fetchItemsStockData } from "../utils/api/inventory";

export const FETCH_INVENTORY_REQUEST = "FETCH_INVENTORY_REQUEST";
export const FETCH_INVENTORY_SUCCESS = "FETCH_INVENTORY_SUCCESS";
export const FETCH_INVENTORY_FAILURE = "FETCH_INVENTORY_FAILURE";

export const fetchInventory = () => async (dispatch) => {
    dispatch({ type: FETCH_INVENTORY_REQUEST });
    try {
        const items = await fetchItemsStockData();
        const storeStocks = {};

        // Group storeStocks
        items.forEach((item) => {
            if (!storeStocks[item.item_id]) {
                storeStocks[item.item_id] = [];
            }
            storeStocks[item.item_id].push({
                store_name: item.store_name,
                in_stock: item.in_stock,
            });
        });

        dispatch({
            type: FETCH_INVENTORY_SUCCESS,
            payload: { items, storeStocks },
        });
    } catch (error) {
        dispatch({
            type: FETCH_INVENTORY_FAILURE,
            payload: error.message,
        });
    }
};
