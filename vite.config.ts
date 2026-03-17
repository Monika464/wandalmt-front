import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": process.env.VITE_API_URL || "http://localhost:3000",
      "/admin": process.env.VITE_API_URL || "http://localhost:3000",
    },
  },
});

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/api": "http://localhost:3000",
//     },
//   },
// });
