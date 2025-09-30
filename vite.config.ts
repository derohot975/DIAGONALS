import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    Icons({
      compiler: 'jsx',
      jsx: 'react',
      iconCustomizer(collection, icon, props) {
        // Personalizzazioni globali per le icone
        props.width = props.width || '24';
        props.height = props.height || '24';
        props.strokeWidth = props.strokeWidth || '2';
        props.strokeLinecap = props.strokeLinecap || 'round';
        props.strokeLinejoin = props.strokeLinejoin || 'round';
      },
      customCollections: {
        // Possibilità di aggiungere icone personalizzate
        custom: FileSystemIconLoader('./client/src/assets/icons'),
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
