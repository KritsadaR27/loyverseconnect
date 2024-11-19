import { combineReducers, applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { inventoryReducer } from "./inventoryReducer";

const rootReducer = combineReducers({
    inventory: inventoryReducer,
    // สามารถเพิ่ม reducers อื่นๆ ที่นี่ได้
});

export const store = createStore(rootReducer, applyMiddleware(thunk));
