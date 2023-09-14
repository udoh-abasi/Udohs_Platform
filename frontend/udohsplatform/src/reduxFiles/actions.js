import { createAction } from "@reduxjs/toolkit";

export const userAction = createAction("USER_ACTION", (user) => {
  return { payload: user };
});

export const isLoadingAction = createAction("IS_LOADING", (loading) => {
  return { payload: loading };
});
