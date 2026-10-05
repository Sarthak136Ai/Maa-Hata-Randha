<<<<<<< HEAD
# 🍽️ Maa Hata Randha — Smart Restaurant Service & Management System

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A modern, responsive, and fully functional **Smart Restaurant Service & Management System** built with **HTML5, CSS3, Vanilla JavaScript, and a lightweight Python synchronization backend**.

It offers **three independent, interconnected portals** designed for **Customers**, **Staff/Kitchen**, and **Store Administrators**, with instant cross-browser real-time data synchronization.

---

## 🌟 Key Features Overview

```
                        ┌──────────────────────────────────────────┐
                        │      Maa Hata Randha Central Hub         │
                        │    (server.py + data.json Persistence)   │
                        └───────────────────┬──────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
               ▼                            ▼                            ▼
    📱 CUSTOMER PORTAL             🧑‍🍳 STAFF PORTAL              👑 ADMIN PORTAL
  • Digital Menu & Ordering    • Live Kitchen Order Pipeline  • Store KPI Dashboard
  • Real-time Order Tracker    • Interactive Floor Seating    • Menu Catalog CRUD
  • Interactive Table Booking  • Waiter Assistance Queue      • Drag & Drop Table Designer
  • Call Waiter / Assistance   • Order Status Transitions     • Analytics (Chart.js)
  • Profile & Loyalty Points   • Reservation Overview         • Staff & Customer Registry
```

---

## 🏛️ Portal Highlights

### 1. 📱 Customer Portal
* **Interactive Digital Menu**: Filter by 7 categories (*Starters, Main Course, Biryani, Pizza, Burgers, Desserts, Beverages*), Veg/Non-Veg toggle, real-time live search, and price/rating sorting.
* **Active Cart & Checkout**: Dynamic quantity adjustment, item removal, 5% GST tax calculation, coupon discount system (`GUSTOFEST` for 15% off), and dine-in table assignment.
* **Visual Table Reservation**: Cinema-style interactive floor plan selection with date and time-slot conflict detector (prevents double bookings), capacity suitability filters (2, 4, 6, 8 pax), and instant booking confirmation/cancellation.
* **Real-time Order Tracker**: Visual multi-stage order progress timeline (`Placed` ➜ `Accepted` ➜ `Preparing` ➜ `Ready` ➜ `Served`).
* **Dine-in Customer Assistance**: Instant service call triggers for *"Call Waiter"*, *"Need Water"*, *"Request Bill"*, and *"Assistance"*.
* **Customer Profile**: User details and password manager with order history.

### 2. 🧑‍🍳 Staff Portal
* **Staff Dashboard**: Real-time operational KPI cards (New Orders, Kitchen Queue, Today's Reservations, Active Assistance Calls).
* **Kitchen Order Management**: Real-time order pipeline with single-click status transitions.
* **Floor Seating & Table Map**: Live visual floor plan highlighting Vacant, Reserved, and Occupied tables, plus flashing red notification bells when customers call for assistance.
* **Assistance Request Queue**: Dedicated ticket stream for incoming customer requests with *Accept* and *Complete* actions.

### 3. 👑 Admin Portal
* **Executive Dashboard**: Today's revenue summary, total orders counter, active floor occupancy, and recent booking logs.
* **Menu Catalog Management**: Complete CRUD interface to Add, Edit, Delete, or toggle availability of food items.
* **Visual Floor Plan Designer**: Interactive drag-and-drop table canvas allowing administrators to position tables and save coordinates globally.
* **Master Orders Log**: Searchable and filterable transaction history with manual status override and revenue breakdown.
* **Staff Directory**: Account management for employees (Waiters, Chefs, Floor Managers).
* **Customer Registry**: Customer database tracking order frequency, total spending, and loyalty points.
* **Business Analytics**: Interactive charts powered by Chart.js (Daily sales revenue, category-wise breakdown, top dishes, order fulfillment distribution).

---

## ⚡ Real-Time Data Synchronization Architecture

The application includes an integrated synchronization layer:
1. **Python Server (`server.py`)**: Built-in HTTP server providing REST API endpoints (`/api/data`, `/api/sync`, `/api/reset`) backed by `data.json`.
2. **Cross-Browser Sync**: Changes made in any browser (Chrome, Edge, Brave, Firefox, Safari) immediately sync to other browsers.
3. **Multi-Tab Sync**: Uses `BroadcastChannel('restaurant_global_sync')` for zero-delay instant tab-to-tab state propagation.
4. **Reactive UI Updates**: Unified `dbGet()` and `dbSet()` helper methods trigger `CustomEvent('db_updated')` to re-render UI components reactively without page reloads.

---

## 📁 Project Directory Structure

```text
Restaurant-Management/
│
├── index.html                      # Landing page with hero banner & portal navigation
├── login.html                      # Unified login with 1-click demo role switcher
├── register.html                   # Customer account registration
├── server.py                       # Python HTTP server & JSON sync backend (Port 5500)
├── data.json                       # Central JSON database file
├── progress.md                     # Architecture tracker & project progress file
├── README.md                       # Complete documentation (This file)
│
├── css/
│   ├── style.css                   # Global styling, design tokens, buttons, forms, modals, toasts
│   ├── dashboard.css               # Sidebar navigation, metric cards, tables, floor layout
│   └── responsive.css              # Responsive layout & mobile navigation styles
│
├── js/
│   ├── app.js                      # Core reactive database engine (dbGet, dbSet, polling, broadcast)
│   ├── auth.js                     # Authentication engine & role-based route guard
│   ├── menu.js                     # Menu rendering, search, category filters, veg/non-veg toggles
│   ├── cart.js                     # Cart calculations, coupon validator, checkout workflow
│   ├── reservation.js              # Table booking logic, slot conflict checker, capacity filter
│   ├── orders.js                   # Customer order placement & waiter assistance dispatch
│   ├── staff.js                    # Staff kitchen pipeline & service request resolver
│   └── admin.js                    # Admin menu CRUD, table designer, staff & revenue analytics
│
├── customer/
│   ├── dashboard.html              # Customer dashboard & quick shortcuts
│   ├── menu.html                   # Digital menu browsing & ordering
│   ├── cart.html                   # Active cart & checkout page
│   ├── reservation.html            # Visual table booking interface
│   ├── orders.html                 # Live order tracker & service call center
│   └── profile.html                # Profile & password management
│
├── staff/
│   ├── dashboard.html              # Staff shift dashboard & metrics
│   ├── orders.html                 # Kitchen order queue & status updater
│   ├── tables.html                 # Live restaurant floor plan view
│   └── requests.html               # Waiter assistance requests queue
│
└── admin/
    ├── dashboard.html              # Executive analytics & store summary
    ├── menu-management.html        # Menu item catalog management (CRUD)
    ├── table-management.html       # Visual drag-and-drop table layout designer
    ├── orders.html                 # Complete master orders transaction ledger
    ├── staff-management.html       # Staff team directory & role assignments
    ├── customers.html              # Customer registry & loyalty points
    └── analytics.html              # Chart.js analytics & visual financial reports
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python 3.x** installed on your system ([Download Python](https://www.python.org/downloads/)).

### Running the Application

1. **Open your terminal** in the project root directory:
   ```bash
   cd Restaurant-Management
   ```

2. **Start the local server**:
   ```bash
   python server.py
   ```
   *(Or `py server.py` / `python3 server.py` depending on your environment)*

3. **Open your web browser** and navigate to:
   👉 **`http://localhost:5500`**

---

## 🔑 Demo Access Credentials

The login page ([`http://localhost:5500/login.html`](http://localhost:5500/login.html)) provides **1-Click Demo Fill buttons** for quick testing:

| Role | Email | Password | Direct Portal URL |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@restaurant.com` | `admin123` | [http://localhost:5500/admin/dashboard.html](http://localhost:5500/admin/dashboard.html) |
| **🧑‍🍳 Staff** | `staff@restaurant.com` | `staff123` | [http://localhost:5500/staff/dashboard.html](http://localhost:5500/staff/dashboard.html) |
| **📱 Customer** | `customer@restaurant.com` | `customer123` | [http://localhost:5500/customer/dashboard.html](http://localhost:5500/customer/dashboard.html) |

---

## 🛠️ Built With

* **Frontend**: HTML5 Semantic Markup, CSS3 (Custom Variables, Flexbox, CSS Grid), Vanilla JavaScript (ES6+).
* **Typography & Icons**: [Outfit Font](https://fonts.google.com/specimen/Outfit), [Font Awesome 6.4.0](https://fontawesome.com/).
* **Data Visualization**: [Chart.js 4.4.0](https://www.chartjs.org/).
* **Backend & Persistence**: Python 3 (`http.server`, `socketserver`), REST JSON Storage (`data.json`), `BroadcastChannel` API.

---

## 📄 License

This project is licensed under the MIT License - feel free to use and modify it for your restaurant and learning projects.
=======
# Maa-Hata-Randha
Smart Restaurant Service and Management System
>>>>>>> 91216920c6d252f4aab88126f8d4ab0398684f01
