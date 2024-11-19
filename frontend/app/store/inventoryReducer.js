import {
    FETCH_INVENTORY_REQUEST,
    FETCH_INVENTORY_SUCCESS,
    FETCH_INVENTORY_FAILURE,
} from "./inventoryActions";

const initialState = {
    items: [],
    storeStocks: {},
    loading: false,
    error: null,
};

export const inventoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_INVENTORY_REQUEST:
            return { ...state, loading: true, error: null };
        case FETCH_INVENTORY_SUCCESS:
            return {
                ...state,
                loading: false,
                items: action.payload.items,
                storeStocks: action.payload.storeStocks,
            };
        case FETCH_INVENTORY_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};
