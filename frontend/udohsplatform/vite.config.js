import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    // This was added for draft.js to work effectively as it was showing error 'global is not defined'
    global: {},
  },
});
