import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: "127.0.0.1", // We changed the host from 'localhost' to '127.0.0.1' so that the sessionid will be stored on the browser's cookie when user's sign in
    port: 5173, // Set the desired port
  },
});
