import { createReducer } from "@reduxjs/toolkit";
import { userAction } from "./actions";

export const userReducer = createReducer("", (builder) => {
  builder.addCase(userAction, (state, action) => {
    const { payload } = action;
    return payload;
  });
});
