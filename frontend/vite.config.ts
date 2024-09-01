import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as fs from "node:fs";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync("cert/key.pem"),
      cert: fs.readFileSync("cert/cert.pem"),
    },
  },
  plugins: [react()],
});
