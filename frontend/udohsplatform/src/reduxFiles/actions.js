import { createAction } from "@reduxjs/toolkit";

export const userAction = createAction("USER_ACTION", (user) => {
  return { payload: user };
});
