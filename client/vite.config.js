import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false, // Disable source maps to hide code
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs
        drop_debugger: true, // Remove debugger statements
      },
      format: {
        comments: false, // Remove comments
      },
      mangle: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-accordion", "@radix-ui/react-alert-dialog", "@radix-ui/react-avatar", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-label", "@radix-ui/react-popover", "@radix-ui/react-select", "@radix-ui/react-slot", "@radix-ui/react-tabs", "@radix-ui/react-toast", "@radix-ui/react-tooltip"],
          icons: ["lucide-react"],
          utils: ["date-fns", "axios", "clsx", "tailwind-merge"],
          animation: ["framer-motion"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
  base: "/", // <-- this makes CSS/JS paths relative
});
