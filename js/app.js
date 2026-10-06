// Shared Restaurant Management Application Logic & Cross-Browser Synchronization

// Global broadcast channel for instant multi-tab sync in the same browser
const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('restaurant_global_sync') : null;

if (syncChannel) {
    syncChannel.onmessage = (event) => {
        if (event.data && event.data.key) {
            try {
                localStorage.setItem(event.data.key, JSON.stringify(event.data.value));
            } catch (e) {}
            window.dispatchEvent(new CustomEvent('db_updated', { detail: event.data }));
        }
    };
}

// Database helper functions that sync with both LocalStorage and the central server API
function dbGet(key) {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : [];
    } catch (e) {
        return [];
    }
}

function dbSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error("LocalStorage write error:", e);
    }

    // Broadcast to other tabs in the same browser
    if (syncChannel) {
        try {
            syncChannel.postMessage({ key, value, timestamp: Date.now() });
        } catch (e) {}
    }

    // Dispatch local custom event for immediate reactive re-render
    window.dispatchEvent(new CustomEvent('db_updated', { detail: { key, value } }));

    // Send to central server API (Vercel Serverless Function & Local server)
    fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
    }).catch(err => {
        // Server might be offline, state remains preserved in LocalStorage
    });
}

// Full database synchronization with backend server / Vercel API
async function syncFromServer() {
    try {
        const res = await fetch('/api/data?_t=' + Date.now(), {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        if (!res.ok) return;
        const serverDb = await res.json();
        
        let hasChanges = false;
        const keys = ['users', 'tables', 'menuItems', 'reservations', 'orders', 'serviceRequests'];

        for (const k of keys) {
            if (serverDb[k] !== undefined) {
                const localStr = localStorage.getItem(k);
                const serverStr = JSON.stringify(serverDb[k]);
                if (localStr !== serverStr) {
                    localStorage.setItem(k, serverStr);
                    hasChanges = true;
                }
            }
        }

        if (hasChanges) {
            localStorage.setItem('rest_db_initialized', 'true');
            window.dispatchEvent(new CustomEvent('db_updated', { detail: { full: true } }));
        }
    } catch (err) {
        // Fallback to local storage if API is not running
    }
}

// Preload database structure on startup
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch from server to get cross-browser synced state
    syncFromServer().then(() => {
        initializeDatabase();
    });

    setupMobileMenu();
    setupProfileDropdown();

    // Background real-time polling every 1.5 seconds for instant multi-browser updates
    setInterval(syncFromServer, 1500);

    // Listen to storage events from other windows
    window.addEventListener('storage', (e) => {
        if (['users', 'tables', 'menuItems', 'reservations', 'orders', 'serviceRequests'].includes(e.key)) {
            window.dispatchEvent(new CustomEvent('db_updated', { detail: { key: e.key } }));
        }
    });
});

function initializeDatabase() {
    if (localStorage.getItem('rest_db_initialized')) {
        return; // Database already loaded
    }

    // 1. Initial Users (Admin, Staff, Customer)
    const initialUsers = [
        { id: "U001", name: "Restaurant Admin", email: "admin@restaurant.com", password: "admin123", role: "admin" },
        { id: "U002", name: "Floor Host Staff", email: "staff@restaurant.com", password: "staff123", role: "staff" },
        { id: "U003", name: "Valued Customer", email: "customer@restaurant.com", password: "customer123", role: "customer" },
        { id: "U004", name: "Alice Chef", email: "chef@restaurant.com", password: "staff123", role: "staff", staffRole: "Chef" },
        { id: "U005", name: "Bob Waiter", email: "waiter@restaurant.com", password: "staff123", role: "staff", staffRole: "Waiter" }
    ];
    if (!localStorage.getItem('users')) dbSet('users', initialUsers);

    // 2. Initial Tables
    const initialTables = [
        { id: "T1", number: "T1", capacity: 2, section: "Window Area", shape: "square", status: "Available", x: 100, y: 100 },
        { id: "T2", number: "T2", capacity: 2, section: "Window Area", shape: "round", status: "Available", x: 250, y: 100 },
        { id: "T3", number: "T3", capacity: 4, section: "Main Dining Area", shape: "square", status: "Available", x: 80, y: 220 },
        { id: "T4", number: "T4", capacity: 4, section: "Main Dining Area", shape: "square", status: "Available", x: 240, y: 220 },
        { id: "T5", number: "T5", capacity: 6, section: "Main Dining Area", shape: "rectangle", status: "Available", x: 400, y: 220 },
        { id: "T6", number: "T6", capacity: 8, section: "Main Dining Area", shape: "rectangle", status: "Available", x: 550, y: 220 },
        { id: "T7", number: "T7", capacity: 2, section: "Outdoor Seating", shape: "round", status: "Available", x: 100, y: 380 },
        { id: "T8", number: "T8", capacity: 4, section: "Outdoor Seating", shape: "square", status: "Available", x: 250, y: 380 },
        { id: "T9", number: "T9", capacity: 4, section: "VIP Section", shape: "square", status: "Available", x: 450, y: 100 },
        { id: "T10", number: "T10", capacity: 6, section: "VIP Section", shape: "rectangle", status: "Available", x: 600, y: 100 }
    ];
    if (!localStorage.getItem('tables')) dbSet('tables', initialTables);

    // 3. Initial Menu (37 items: Veg, Non-Veg, Starters, Main Course, Fast Foods, Biryani, Desserts, Beverages)
    const initialMenu = [
        { id: "M001", name: "Paneer Tikka", category: "Starters", description: "Cottage cheese cubes marinated in spiced hung curd, bell peppers, and roasted in clay tandoor.", price: 240, rating: 4.8, isVeg: true, image: "/images/dishes/M001.jpg", available: true },
        { id: "M002", name: "Crispy Spring Rolls", category: "Starters", description: "Golden fried rolls stuffed with crunchy julienne vegetables and glass noodles, served with sweet chilli dip.", price: 180, rating: 4.5, isVeg: true, image: "/images/dishes/M002.jpg", available: true },
        { id: "M003", name: "Hara Bhara Kebab", category: "Starters", description: "Pan-seared spinach, green peas, and potato patties scented with royal spices and roasted cashew nuts.", price: 210, rating: 4.6, isVeg: true, image: "/images/dishes/M003.jpg", available: true },
        { id: "M004", name: "Crispy Chilli Corn", category: "Starters", description: "Sweet corn kernels tossed with crushed black pepper, spring onion, fresh chillies, and lemon zest.", price: 190, rating: 4.4, isVeg: true, image: "/images/dishes/M004.jpg", available: true },
        { id: "M005", name: "Chicken Seekh Kebab", category: "Starters", description: "Minced chicken skewers blended with fresh herbs, ginger, and aromatic spices grilled over charcoal embers.", price: 290, rating: 4.7, isVeg: false, image: "/images/dishes/M005.jpg", available: true },
        { id: "M006", name: "Chicken Malai Tikka", category: "Starters", description: "Tender chicken morsels marinated in rich cream, cashew paste, cardamom, and gentle cheese glaze.", price: 320, rating: 4.9, isVeg: false, image: "/images/dishes/M006.jpg", available: true },
        { id: "M007", name: "Amritsari Fish Fry", category: "Starters", description: "Crispy carom-spiced batter fried river sole fish fillets served with mint chutney and onion rings.", price: 360, rating: 4.8, isVeg: false, image: "/images/dishes/M007.jpg", available: true },
        { id: "M008", name: "Golden Fried Prawns", category: "Starters", description: "Butterflied tiger prawns coated in panko breadcrumbs and fried golden crisp with garlic tartar dip.", price: 420, rating: 4.9, isVeg: false, image: "/images/dishes/M008.jpg", available: true },
        { id: "M009", name: "Paneer Butter Masala", category: "Main Course", description: "Fresh cottage cheese simmered in a velvet-smooth buttery tomato gravy enriched with fenugreek leaves.", price: 320, rating: 4.8, isVeg: true, image: "/images/dishes/M009.jpg", available: true },
        { id: "M010", name: "Dal Makhani", category: "Main Course", description: "Black lentils and kidney beans slow-cooked overnight with churned butter and fresh cream on charcoal tandoor.", price: 260, rating: 4.9, isVeg: true, image: "/images/dishes/M010.jpg", available: true },
        { id: "M011", name: "Kadai Paneer", category: "Main Course", description: "Cottage cheese and crisp bell peppers stir-fried in a spicy freshly pounded coriander and red chilli gravy.", price: 310, rating: 4.6, isVeg: true, image: "/images/dishes/M011.jpg", available: true },
        { id: "M012", name: "Shahi Malai Kofta", category: "Main Course", description: "Melt-in-mouth cottage cheese and dry-fruit dumplings in a fragrant saffron cashew nut sauce.", price: 340, rating: 4.7, isVeg: true, image: "/images/dishes/M012.jpg", available: true },
        { id: "M013", name: "Butter Chicken", category: "Main Course", description: "Tandoori grilled chicken chunks braised in a luxurious satin tomato, butter, honey, and cream sauce.", price: 380, rating: 4.9, isVeg: false, image: "/images/dishes/M013.jpg", available: true },
        { id: "M014", name: "Chicken Tikka Masala", category: "Main Course", description: "Charcoal roasted chicken tikka cooked in an onion-tomato spicy masala with bell peppers.", price: 370, rating: 4.7, isVeg: false, image: "/images/dishes/M014.jpg", available: true },
        { id: "M015", name: "Mutton Rogan Josh", category: "Main Course", description: "Tender Kashmiri lamb shanks slow-simmered in aromatic fennel, ginger, and ratanjot spiced red gravy.", price: 450, rating: 4.9, isVeg: false, image: "/images/dishes/M015.jpg", available: true },
        { id: "M016", name: "Garlic Butter Naan Basket", category: "Main Course", description: "Freshly baked tandoori leavened flatbread brushed with garlic butter and fresh coriander (3 pieces).", price: 120, rating: 4.7, isVeg: true, image: "/images/dishes/M016.jpg", available: true },
        { id: "M017", name: "Hyderabadi Chicken Dum Biryani", category: "Biryani", description: "Aromatic long-grain basmati rice layered with spiced marinated chicken and slow-steamed in a sealed clay pot.", price: 360, rating: 4.9, isVeg: false, image: "/images/dishes/M017.jpg", available: true },
        { id: "M018", name: "Royal Mutton Dum Biryani", category: "Biryani", description: "Prime cuts of juicy mutton slow-cooked with saffron-infused basmati rice, fried onions, and kewra essence.", price: 440, rating: 4.9, isVeg: false, image: "/images/dishes/M018.jpg", available: true },
        { id: "M019", name: "Veg Dum Biryani", category: "Biryani", description: "Garden vegetables, paneer cubes, and fragrant basmati rice layered with mint, saffron, and roasted nuts.", price: 280, rating: 4.5, isVeg: true, image: "/images/dishes/M019.jpg", available: true },
        { id: "M020", name: "Margherita Pizza (10 inch)", category: "Fast Foods", description: "Hand-stretched artisan crust topped with Italian San Marzano tomato sauce, fresh basil, and mozzarella cheese.", price: 310, rating: 4.6, isVeg: true, image: "/images/dishes/M020.jpg", available: true },
        { id: "M021", name: "Chicken Feast Supreme Pizza", category: "Fast Foods", description: "Loaded with BBQ grilled chicken, spicy peri peri chicken, red onions, jalapenos, and mozzarella.", price: 410, rating: 4.8, isVeg: false, image: "/images/dishes/M021.jpg", available: true },
        { id: "M022", name: "Farmhouse Veggie Pizza", category: "Fast Foods", description: "Loaded with mushrooms, bell peppers, sweet corn, black olives, red paprika, and mozzarella cheese.", price: 350, rating: 4.5, isVeg: true, image: "/images/dishes/M022.jpg", available: true },
        { id: "M023", name: "Classic Aloo Tikki Burger", category: "Fast Foods", description: "Crispy spiced herb potato patty, tomato slice, crunchy lettuce, and tangy mint mayo in toasted sesame bun.", price: 150, rating: 4.3, isVeg: true, image: "/images/dishes/M023.jpg", available: true },
        { id: "M024", name: "Crispy Chicken Zinger Burger", category: "Fast Foods", description: "Super crunchy spiced fried chicken breast fillet, melted cheddar cheese slice, coleslaw, and sriracha aioli.", price: 240, rating: 4.8, isVeg: false, image: "/images/dishes/M024.jpg", available: true },
        { id: "M025", name: "Cheesy Peri Peri French Fries", category: "Fast Foods", description: "Crispy golden potato fries tossed in fiery African peri peri seasoning and drizzled with warm cheese sauce.", price: 160, rating: 4.7, isVeg: true, image: "/images/dishes/M025.jpg", available: true },
        { id: "M026", name: "Loaded Mexican Nachos", category: "Fast Foods", description: "Crispy corn tortilla chips baked with cheddar cheese, refried beans, pico de gallo salsa, and sour cream.", price: 220, rating: 4.6, isVeg: true, image: "/images/dishes/M026.jpg", available: true },
        { id: "M027", name: "Paneer Tikka Kathi Roll", category: "Fast Foods", description: "Smoky tandoori paneer cubes, crunchy onions, and green mint chutney wrapped in a flaky paratha.", price: 190, rating: 4.6, isVeg: true, image: "/images/dishes/M027.jpg", available: true },
        { id: "M028", name: "Chicken Shawarma Roll", category: "Fast Foods", description: "Shredded rotisserie spiced chicken, pickled cucumbers, garlic toum sauce, and fries rolled in warm pita.", price: 220, rating: 4.8, isVeg: false, image: "/images/dishes/M028.jpg", available: true },
        { id: "M029", name: "Molten Chocolate Lava Cake", category: "Desserts", description: "Warm dark chocolate sponge cake with a rich oozing molten Belgian chocolate center, served fresh.", price: 190, rating: 4.9, isVeg: true, image: "/images/dishes/M029.jpg", available: true },
        { id: "M030", name: "Gulab Jamun with Ice Cream", category: "Desserts", description: "Warm golden milk dumplings soaked in cardamom-saffron sugar syrup served with rich vanilla bean ice cream.", price: 150, rating: 4.8, isVeg: true, image: "/images/dishes/M030.jpg", available: true },
        { id: "M031", name: "Royal Rasmalai (2 Pcs)", category: "Desserts", description: "Soft and spongy cottage cheese patties soaked in chilled, thick cardamom and pistachio-infused saffron milk.", price: 170, rating: 4.9, isVeg: true, image: "/images/dishes/M031.jpg", available: true },
        { id: "M032", name: "Sizzling Brownie with Vanilla", category: "Desserts", description: "Warm walnut brownie served on a hot sizzling skillet topped with vanilla ice cream and hot fudge sauce.", price: 220, rating: 4.9, isVeg: true, image: "/images/dishes/M032.jpg", available: true },
        { id: "M033", name: "Fresh Lime Soda (Sweet & Salt)", category: "Beverages", description: "Sparkling bubbly soda mixed with freshly squeezed lime juice, mint leaves, rock salt, and ice.", price: 95, rating: 4.4, isVeg: true, image: "/images/dishes/M033.jpg", available: true },
        { id: "M034", name: "Iced Caramel Macchiato", category: "Beverages", description: "Freshly brewed espresso poured over chilled whole milk, vanilla syrup, and drizzled with caramel sauce.", price: 170, rating: 4.7, isVeg: true, image: "/images/dishes/M034.jpg", available: true },
        { id: "M035", name: "Virgin Blue Lagoon Mocktail", category: "Beverages", description: "Refreshing blend of blue curacao syrup, crushed ice, sprite, fresh mint leaves, and lemon wedge.", price: 160, rating: 4.6, isVeg: true, image: "/images/dishes/M035.jpg", available: true },
        { id: "M036", name: "Alphonso Mango Lassi", category: "Beverages", description: "Traditional thick and creamy yogurt smoothie churned with sweet Alphonso mango pulp and saffron.", price: 140, rating: 4.9, isVeg: true, image: "/images/dishes/M036.jpg", available: true },
        { id: "M037", name: "Oreo Chocolate Crunch Milkshake", category: "Beverages", description: "Thick creamy shake blended with crunchy Oreo cookies, chocolate sauce, and topped with whipped cream.", price: 180, rating: 4.8, isVeg: true, image: "/images/dishes/M037.jpg", available: true }
    ];
    if (!localStorage.getItem('menuItems')) dbSet('menuItems', initialMenu);

    // 4. Initial Reservations
    const initialReservations = [
        {
            reservationId: "RES9801",
            customerId: "U003",
            customerName: "Valued Customer",
            date: new Date().toISOString().split('T')[0],
            timeSlot: "19:00-21:00",
            guests: 4,
            tableId: "T3",
            status: "Confirmed"
        }
    ];
    if (!localStorage.getItem('reservations')) dbSet('reservations', initialReservations);

    // 5. Initial Orders
    const initialOrders = [
        {
            orderId: "ORD1001",
            customerId: "U003",
            customerName: "Valued Customer",
            items: [
                { id: "M001", name: "Paneer Tikka", price: 240, qty: 1 },
                { id: "M004", name: "Butter Chicken", price: 380, qty: 1 },
                { id: "M007", name: "Chicken Dum Biryani", price: 350, qty: 2 }
            ],
            orderType: "Dine-in",
            tableId: "T3",
            subtotal: 1320,
            tax: 66,
            discount: 0,
            total: 1386,
            status: "Served",
            createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
        },
        {
            orderId: "ORD1002",
            customerId: "U003",
            customerName: "Valued Customer",
            items: [
                { id: "M010", name: "Margherita Pizza", price: 300, qty: 2 },
                { id: "M017", name: "Iced Caramel Macchiato", price: 160, qty: 2 }
            ],
            orderType: "Takeaway",
            tableId: "",
            subtotal: 920,
            tax: 46,
            discount: 50,
            total: 916,
            status: "Preparing",
            createdAt: new Date(Date.now() - 15 * 60000).toISOString()
        }
    ];
    if (!localStorage.getItem('orders')) dbSet('orders', initialOrders);

    // 6. Initial Service Requests
    const initialRequests = [
        {
            requestId: "REQ7001",
            tableId: "T3",
            type: "Call Waiter",
            status: "Pending",
            createdAt: new Date(Date.now() - 5 * 60000).toISOString()
        }
    ];
    if (!localStorage.getItem('serviceRequests')) dbSet('serviceRequests', initialRequests);

    localStorage.setItem('rest_db_initialized', 'true');
}

// User helper getters
function getCurrentUser() {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
}

function checkAccess(allowedRoles) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '../login.html';
        return null;
    }
    if (!allowedRoles.includes(user.role)) {
        showToast("Access Denied!", "error");
        setTimeout(() => {
            if (user.role === 'admin') window.location.href = '../admin/dashboard.html';
            else if (user.role === 'staff') window.location.href = '../staff/dashboard.html';
            else window.location.href = '../customer/dashboard.html';
        }, 1500);
        return null;
    }
    return user;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../login.html';
}

// Toast System
function showToast(message, type = "success") {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    else if (type === 'warning') iconClass = 'fa-circle-exclamation';
    else if (type === 'info') iconClass = 'fa-circle-info';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// UI Handlers
function setupMobileMenu() {
    const toggleBtn = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

function setupProfileDropdown() {
    const profile = document.querySelector('.user-profile');
    if (profile) {
        profile.addEventListener('click', () => {
            const dropdown = document.querySelector('.profile-dropdown');
            if (dropdown) dropdown.classList.toggle('active');
        });
    }
}
