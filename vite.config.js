import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const distDir = resolve(import.meta.dirname, 'dist');
      ['css', 'js'].forEach((dir) => {
        const src = resolve(import.meta.dirname, dir);
        const dest = resolve(distDir, dir);
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true });
        }
      });
      const dataSrc = resolve(import.meta.dirname, 'data.json');
      if (fs.existsSync(dataSrc)) {
        fs.copyFileSync(dataSrc, resolve(distDir, 'data.json'));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyStaticAssets()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5500',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        app: resolve(import.meta.dirname, 'app.html'),
        login: resolve(import.meta.dirname, 'login.html'),
        register: resolve(import.meta.dirname, 'register.html'),
        customerDashboard: resolve(import.meta.dirname, 'customer/dashboard.html'),
        customerMenu: resolve(import.meta.dirname, 'customer/menu.html'),
        customerCart: resolve(import.meta.dirname, 'customer/cart.html'),
        customerReservation: resolve(import.meta.dirname, 'customer/reservation.html'),
        customerOrders: resolve(import.meta.dirname, 'customer/orders.html'),
        customerProfile: resolve(import.meta.dirname, 'customer/profile.html'),
        staffDashboard: resolve(import.meta.dirname, 'staff/dashboard.html'),
        staffOrders: resolve(import.meta.dirname, 'staff/orders.html'),
        staffTables: resolve(import.meta.dirname, 'staff/tables.html'),
        staffRequests: resolve(import.meta.dirname, 'staff/requests.html'),
        adminDashboard: resolve(import.meta.dirname, 'admin/dashboard.html'),
        adminMenu: resolve(import.meta.dirname, 'admin/menu-management.html'),
        adminTables: resolve(import.meta.dirname, 'admin/table-management.html'),
        adminOrders: resolve(import.meta.dirname, 'admin/orders.html'),
        adminStaff: resolve(import.meta.dirname, 'admin/staff-management.html'),
        adminCustomers: resolve(import.meta.dirname, 'admin/customers.html'),
        adminAnalytics: resolve(import.meta.dirname, 'admin/analytics.html'),
      },
    },
  },
});
