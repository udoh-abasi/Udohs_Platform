import { configureStore } from "@reduxjs/toolkit";
import { isLoadingReducer, userReducer } from "./reducers";

const store = configureStore({
  reducer: { user: userReducer, isLoading: isLoadingReducer },
});

export default store;
