# 📋 Smart Restaurant Service & Management System — Progress Tracker
> **Brand Name**: Maa Hata Randha (Smart Restaurant & Service Management)  
> **Server Command**: `python server.py` (Runs on `http://localhost:5500`)  
> **Rule for AI Assistants / Devs**: ALWAYS check this file first before reading multiple workspace files to understand the project architecture and save tokens. Update this file whenever a feature is added, modified, or removed.

---

## 🏗️ Project Structure & File Map

```text
Restaurant-Management/
│
├── package.json                    # Dependencies (React 19, Vite, Lucide-React)
├── vite.config.js                  # Vite configuration with React HMR plugin & multi-page rollup
├── app.html                        # React Interactive Portal mount page
├── src/
│   ├── main.jsx                    # React root entry point
│   ├── App.jsx                     # Master React Portal shell with multi-module navigation
│   ├── index.css                   # Modern CSS styling for React components & animations
│   ├── context/
│   │   └── RestaurantContext.jsx   # React Context state provider synced with backend REST API
│   └── components/
│       ├── DigitalMenu.jsx         # Interactive menu with dietary filter, live search & quick add
│       ├── LiveCart.jsx            # Real-time cart drawer with discount coupons & GST computation
│       ├── TableReservation.jsx    # Cinema-style visual table floor seating map & booking engine
│       ├── KitchenPipeline.jsx     # Real-time kitchen order kanban with 1-click status advances
│       ├── ServiceRequests.jsx     # Live guest assistance queue (Call Waiter, Water, Bill)
│       ├── AnalyticsDashboard.jsx  # Admin live sales metrics & category revenue breakdown
│       └── OrderTracker.jsx        # Live milestone order progress tracker for customers
│
├── index.html                      # Landing page with hero banner & direct portal entry
├── login.html                      # Multi-role authentication (Admin, Staff, Customer) with 1-click demo fill
├── register.html                   # Customer account registration
├── server.py                       # Python HTTP server, JSON sync backend & Auto Live-Reload watcher on port 5500
├── data.json                       # Central JSON database for cross-browser synchronization
├── progress.md                     # Central progress & architecture tracker (This file)
├── README.md                       # Comprehensive documentation & setup guide
│
├── css/
│   ├── style.css                   # Global styles, variables, typography, buttons, modals, toasts
│   ├── dashboard.css               # Portal sidebar layouts, tables, KPI metric cards, status badges
│   └── responsive.css              # Mobile navigation, responsiveness breakpoints
│
├── js/
│   ├── app.js                      # Core state engine, dbGet/dbSet, storage sync & notification system
│   ├── auth.js                     # Login/registration, role-based redirection, session helpers
│   ├── menu.js                     # Menu rendering, search, category filters, veg/non-veg toggles
│   ├── cart.js                     # Cart items management, tax calculation, coupon validation
│   ├── reservation.js              # Table booking logic, time-slot conflict detector, capacity filter
│   ├── orders.js                   # Customer order placement & real-time service request dispatcher
│   ├── staff.js                    # Staff kitchen pipeline, order status changer, request resolver
│   └── admin.js                    # Admin menu CRUD, table floor designer, staff & revenue analytics
│
├── customer/
│   ├── dashboard.html              # Customer overview, quick booking, promo banners, loyalty points
│   ├── menu.html                   # Digital interactive menu with category filters and instant add-to-cart
│   ├── cart.html                   # Active cart view, table selection, GST tax calculation, checkout
│   ├── reservation.html            # Cinema-style interactive table reservation & booking history
│   ├── orders.html                 # Live order tracker timeline & "Call Waiter" assistance buttons
│   └── profile.html                # Customer profile details and password manager
│
├── staff/
│   ├── dashboard.html              # Staff shift KPI metrics, urgent notifications, and active summary
│   ├── orders.html                 # Kitchen order pipeline (Placed ➜ Accepted ➜ Preparing ➜ Ready ➜ Served)
│   ├── tables.html                 # Live floor seating map (Occupied, Reserved, Service Call alerts)
│   └── requests.html               # Dedicated assistance request queue (Call Waiter, Water, Bill)
│
└── admin/
    ├── dashboard.html              # Executive summary: Today's revenue, active tables, orders counter
    ├── menu-management.html        # Menu catalog CRUD (Add dish, edit prices, toggle availability)
    ├── table-management.html       # Visual drag-and-drop floor table layout designer
    ├── orders.html                 # Master transactions log with status override & revenue filter
    ├── staff-management.html       # Staff team directory & employee management
    ├── customers.html              # Customer registry with order histories and loyalty points
    └── analytics.html              # Chart.js charts: Daily revenue, sales by category, top dishes
```

---

## 🚀 Implemented Features & Architecture Status

### ✅ 1. Foundation & Cross-Browser Synchronization
* **Unified Central Server (`server.py`)**: Built-in Python HTTP server with live REST API (`/api/data`, `/api/reset`) and persistent `data.json`.
* **Universal Real-time Synchronization**:
  * Cross-Browser Sync: Live syncing between Chrome, Brave, Edge, Firefox, Mobile.
  * Multi-Tab Sync: `BroadcastChannel('restaurant_global_sync')` for immediate tab-to-tab communication.
  * Real-time Reactivity: Centralized `dbGet()` & `dbSet()` dispatching `db_updated` events with background polling.
* **Design & Theme**:
  * Clean modern UI, Outfit typography, smooth animations, glassmorphism badges, and responsive sidebar navigation.

### ✅ 2. Authentication & Landing
* **Landing Page (`index.html`)**: Restaurant showcase with service highlights, navigation links, and direct portal entrances. Brand: *Maa Hata Randha*.
* **Authentication Engine (`login.html` & `js/auth.js`)**:
  * Role-based access control (Customer ➜ Customer Dashboard, Staff ➜ Staff Dashboard, Admin ➜ Admin Dashboard).
  * 1-Click demo fill buttons for instant testing.
  * Session isolation and security checks (`checkAccess()`).
* **Registration Page (`register.html`)**: Customer signup adding new users to the synchronized database.

### ✅ 3. Customer Portal (`customer/`)
* **Dashboard (`dashboard.html`)**: Welcome greeting, promo banners, loyalty points, active order status, quick booking.
* **Digital Menu (`menu.html`)**: 7 categories (Starters, Main Course, Biryani, Pizza, Burgers, Desserts, Beverages), Veg/Non-Veg filters, live search, sort by price/rating.
* **Cart & Checkout (`cart.html`)**: Item quantity increment/decrement, 5% GST tax calculation, coupon discounts (`GUSTOFEST`), dine-in table selector.
* **Table Booking (`reservation.html`)**: Cinema-style interactive floor plan selection, time-slot conflict detector, capacity suitability filtering, booking confirmation and cancellation.
* **Live Order Tracking (`orders.html`)**: Visual progress timeline (`Placed` ➜ `Accepted` ➜ `Preparing` ➜ `Ready` ➜ `Served`), assistance call buttons ("Call Waiter", "Need Water", "Request Bill").
* **Account Settings (`profile.html`)**: Profile and password management.

### ✅ 4. Staff Portal (`staff/`)
* **Staff Dashboard (`dashboard.html`)**: Operational summary metrics (New Orders, Active in Kitchen, Today's Bookings, Assistance Requests).
* **Kitchen Order Pipeline (`orders.html`)**: Real-time status progression (`Placed` ➜ `Accepted` ➜ `Preparing` ➜ `Ready` ➜ `Served`).
* **Dining Floor Map (`tables.html`)**: Visual indicators for vacant, reserved, dining occupied, and flashing red alerts for service requests.
* **Assistance Request Queue (`requests.html`)**: Ticket queue for waiter calls with Accept and Complete actions.

### ✅ 5. Admin Portal (`admin/`)
* **Admin Dashboard (`dashboard.html`)**: High-level store metrics (Revenue, Total Orders, Active Reservations, Staff Count).
* **Menu Management (`menu-management.html`)**: Full CRUD operations to Add, Edit, Delete, or toggle availability of food items.
* **Table Layout Designer (`table-management.html`)**: Visual drag-and-drop table layout canvas with coordinate persistence.
* **Orders Master (`orders.html`)**: Filterable master transaction log with status override and revenue summations.
* **Staff Directory (`staff-management.html`)**: Employee account management (Waiters, Chefs, Managers).
* **Customer Registry (`customers.html`)**: Guest profile directory with order history and loyalty points.
* **Executive Analytics (`analytics.html`)**: Interactive Chart.js graphs displaying daily sales revenue, category breakdown, top dishes.

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Direct Portal URL |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@restaurant.com` | `admin123` | [http://localhost:5500/admin/dashboard.html](http://localhost:5500/admin/dashboard.html) |
| **Staff** | `staff@restaurant.com` | `staff123` | [http://localhost:5500/staff/dashboard.html](http://localhost:5500/staff/dashboard.html) |
| **Customer** | `customer@restaurant.com` | `customer123` | [http://localhost:5500/customer/dashboard.html](http://localhost:5500/customer/dashboard.html) |

## 📅 Changelog & Recent Updates

* **[2026-10-06] Comprehensive 37-Dish Food Photography Audit & Local Asset Pipeline Completed**:
  * Performed a complete, item-by-item audit of all 37 food items (`M001` through `M037`) across all 6 categories (Starters, Main Course, Biryani, Fast Foods, Desserts, Beverages).
  * Replaced all external Unsplash URLs with verified local high-resolution photographs (`/images/dishes/M001.jpg` to `/images/dishes/M037.jpg`), ensuring zero 404/403/CORS or CDN latency issues on both local server and Vercel cloud deployment.
  * Verified exact visual correspondence for every dish (e.g. Malai Tikka, Amritsari Fish Fry, Golden Fried Prawns, Dal Makhani, Kadai Paneer, Shahi Malai Kofta, Mutton Biryani, Blue Lagoon Mocktail, Garlic Naan Basket).
  * Upgraded `server.py` with `ThreadingHTTPServer` and disabled Windows reverse DNS delay in `address_string()` for sub-millisecond local response times.
  * Synchronized updated item image paths across [`data.json`](file:///c:/Users/hp/OneDrive/Desktop/Restaurant-Management/data.json), [`js/app.js`](file:///c:/Users/hp/OneDrive/Desktop/Restaurant-Management/js/app.js), [`server.py`](file:///c:/Users/hp/OneDrive/Desktop/Restaurant-Management/server.py), and the Vite production bundle (`dist/`).

* **[2026-10-06] Vercel Cloud Serverless API & Real-Time Portal Synchronization Integrated**:
  * Resolved multi-portal cross-device synchronization failure on Vercel deployment (`https://maa-hata-randha.vercel.app/`).
  * Created Vercel Serverless Function endpoints:
    * `api/data.js`: Full Node.js REST API handling `GET`, `POST`, `OPTIONS`, `PUT`, `DELETE` with universal CORS, cache-busting headers, memory state caching, and initial data seeding from `data.json`.
    * `api/reset.js`: Serverless database reset endpoint to restore default catalog and floor plan configuration.
  * Added `vercel.json` routing configuration mapping `/api/data` and `/api/reset` directly to serverless function endpoints with zero-caching policies.
  * Upgraded `js/app.js` and `src/context/RestaurantContext.jsx` with timestamped cache-busting polling (`/api/data?_t=...`), bidirectional `BroadcastChannel` synchronization, `localStorage` immediate mirror, and `CustomEvent('db_updated')` dispatching.
  * Added real-time `db_updated` listeners across all admin modules (`menu-management.html`, `table-management.html`, `staff-management.html`, `customers.html`, `analytics.html`) ensuring changes from customer orders or table bookings immediately reflect in the admin and staff views without manual page refresh.
* **[2026-10-05] GitHub Remote Repository Synchronized & Optimized**:
  * Added production-ready `.gitignore` excluding `node_modules/`, logs, and temporary caches.
  * Successfully pushed all 53 project source files, React portal suite, Vite configuration, server script, and full documentation to [`Sarthak136Ai/Maa-Hata-Randha`](https://github.com/Sarthak136Ai/Maa-Hata-Randha) on branch `main`.
* **[2026-09-30] Full React Suite & Automatic Live-Reload Engine Integrated**:
  * Built complete modern React application in `src/` powered by **React 19**, **Vite**, and **Lucide-React**.
  * Developed modular, high-aesthetic interactive React components:
    * `DigitalMenu.jsx`: Category pills, pure veg / non-veg toggles, live search, sorting, quantity stepper, and quick preview modal.
    * `LiveCart.jsx`: Real-time slide-out cart drawer with coupon validation (`MAAHATA10`, `GUSTOFEST`), 5% GST calculation, table selector, and Dine Points estimator.
    * `TableReservation.jsx`: Cinema-style visual table floor seating plan with live status states (Available, Selected, Reserved, Occupied) and instant booking confirmation.
    * `KitchenPipeline.jsx`: Real-time Kitchen Display System (KDS) kanban with 1-click status advances (`Placed` ➜ `Accepted` ➜ `Preparing` ➜ `Ready` ➜ `Served`) and sound chime alert controls.
    * `ServiceRequests.jsx`: Instant assistance call desk (Call Waiter, Water, Bill) with real-time floor staff queue.
    * `AnalyticsDashboard.jsx`: Executive sales KPIs, category revenue share bars, and top-selling dish rankings.
    * `OrderTracker.jsx`: Customer milestone step timeline with pulsating active status indicator.
  * Added **Dual Auto-Reload & HMR Engine**:
    * **Vite Hot Module Replacement (HMR)** (`npm run dev`) for instant sub-millisecond component updates without state loss.
    * **Python Built-in Live-Reload Engine** (`server.py` on `http://localhost:5500`) with filesystem watcher and automatic HTML injection so any code change automatically reloads connected browser tabs.
* **[2026-09-30] Comprehensive Food Catalog & High-Res Imagery Verified**:
  * Verified, checked, and added 37 authentic high-resolution food photography URLs for every menu item across **Starters**, **Main Course**, **Biryani**, **Fast Foods** (Pizzas, Burgers, Fries, Nachos, Wraps), **Desserts**, and **Beverages**.
  * Added lazy loading (`loading="lazy"`) and graceful fallback handlers (`onerror`) across [`customer/dashboard.html`](file:///c:/Users/hp/OneDrive/Desktop/Restaurant-Management/customer/dashboard.html), [`customer/menu.html`](file:///c:/Users/hp/OneDrive/Desktop/Restaurant-Management/customer/menu.html), and [`admin/menu-management.html`](file:///c:/Users/hp/OneDrive/Desktop/Restaurant-Management/admin/menu-management.html) ensuring seamless rendering without broken image states.
  * Added interactive Category Filter Pills, Veg/Non-Veg dietary toggles, live search, and 1-click Add-to-Cart directly on the Customer Dashboard.
  * Synced full 37-item catalog to [`data.json`](file:///c:/Users/hp/OneDrive/Desktop/Restaurant-Management/data.json) and fallback initialization in [`js/app.js`](file:///c:/Users/hp/OneDrive/Desktop/Restaurant-Management/js/app.js).
* **[2026-09-30] Universal Branding & Loyalty Points Rename**:
  * Updated the brand name from **Gusto Bistro** to **Maa Hata Randha** across all pages, sidebars, page titles, headers, and footers.
  * Renamed **Gusto Points** to **Dine Points** in customer dashboard and admin customer registry tables.
* **[2026-09-30] Authentication & User Registration Sync Fix**:
  * Updated `js/auth.js` to use `dbGet('users')` and `dbSet('users', users)` instead of direct `localStorage` calls so newly registered user accounts sync seamlessly to the central backend (`data.json`) and across all active browser windows.
* **[2026-09-29] Project Documentation (`README.md`) Added**:
  * Created complete [`README.md`](file:///c:/Users/hp/OneDrive/Desktop/Restaurant-Management/README.md) with system architecture diagram, full portal feature breakdown, quick-start guide, and credentials table.
* **[2026-09-15] Branding & Progress Synchronization Updated**:
  * Updated branding to **Maa Hata Randha** on landing page.
  * Consolidated full project file map and token-saving rules in `progress.md`.
  * Set up permanent rule for AI agents to check `progress.md` before performing whole-folder reads.
* **[2026-09-01] Universal Cross-Browser Sync Added**:
  * Implemented `server.py` with `/api/data` JSON backend to solve browser-isolation barriers between Chrome, Brave, and Edge.
  * Integrated `BroadcastChannel` and `CustomEvent('db_updated')` across all JS handlers (`app.js`, `cart.js`, `reservation.js`, `orders.js`, `staff.js`, `admin.js`).
  * Updated Customer and Staff templates to reactively re-render whenever data is changed from any portal.
