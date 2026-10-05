import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RestaurantContext = createContext(null);

const DEFAULT_INITIAL_DATA = {
  users: [
    { id: "U001", name: "Restaurant Admin", email: "admin@restaurant.com", password: "admin123", role: "admin" },
    { id: "U002", name: "Floor Host Staff", email: "staff@restaurant.com", password: "staff123", role: "staff" },
    { id: "U003", name: "Valued Customer", email: "customer@restaurant.com", password: "customer123", role: "customer" },
    { id: "U004", name: "Alice Chef", email: "chef@restaurant.com", password: "staff123", role: "staff", staffRole: "Chef" },
    { id: "U005", name: "Bob Waiter", email: "waiter@restaurant.com", password: "staff123", role: "staff", staffRole: "Waiter" }
  ],
  tables: [
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
  ],
  menuItems: [],
  reservations: [],
  orders: [],
  serviceRequests: []
};

export const RestaurantProvider = ({ children }) => {
  const [db, setDb] = useState(DEFAULT_INITIAL_DATA);
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch from server / local storage
  const loadData = useCallback(async () => {
    try {
      // 1. Try local storage cache
      const localUsers = localStorage.getItem('users');
      const localMenu = localStorage.getItem('menuItems');
      const localTables = localStorage.getItem('tables');
      const localOrders = localStorage.getItem('orders');
      const localRes = localStorage.getItem('reservations');
      const localReq = localStorage.getItem('serviceRequests');

      if (localMenu && localUsers) {
        setDb({
          users: JSON.parse(localUsers || '[]'),
          menuItems: JSON.parse(localMenu || '[]'),
          tables: JSON.parse(localTables || '[]'),
          orders: JSON.parse(localOrders || '[]'),
          reservations: JSON.parse(localRes || '[]'),
          serviceRequests: JSON.parse(localReq || '[]')
        });
      }

      // 2. Fetch fresh backend state
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setDb(data);
        // sync to local storage
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key])) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        });
        setSyncStatus('synced');
      }
    } catch (err) {
      console.warn('Backend offline or using local state:', err);
    }
  }, []);

  // Update DB entity
  const updateDbKey = useCallback(async (key, value) => {
    // 1. Local React update
    setDb(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(key, JSON.stringify(value));
      return next;
    });

    // 2. Broadcast Channel update
    try {
      if (window.BroadcastChannel) {
        const bc = new BroadcastChannel('restaurant_global_sync');
        bc.postMessage({ type: 'sync_update', key, value });
        bc.close();
      }
    } catch (e) {}

    // 3. Server persistence
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch (err) {
      console.warn('Sync post error:', err);
    }
  }, []);

  // Load Current User & Cart
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    } else {
      // Default demo customer
      const defaultUser = { id: "U003", name: "Valued Customer", email: "customer@restaurant.com", role: "customer" };
      setCurrentUser(defaultUser);
    }

    const cartStr = localStorage.getItem('cart');
    if (cartStr) {
      try {
        setCart(JSON.parse(cartStr));
      } catch (e) {}
    }

    loadData();

    // BroadcastChannel sync listener
    let bc;
    try {
      bc = new BroadcastChannel('restaurant_global_sync');
      bc.onmessage = (event) => {
        if (event.data && event.data.key) {
          setDb(prev => ({
            ...prev,
            [event.data.key]: event.data.value
          }));
        }
      };
    } catch (e) {}

    // Polling interval
    const interval = setInterval(loadData, 4000);

    return () => {
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [loadData]);

  // Cart operations
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (dishId, qty = 1) => {
    const dish = (db.menuItems || []).find(d => d.id === dishId);
    if (!dish) return;

    const existingIndex = cart.findIndex(item => item.id === dishId);
    let newCart;
    if (existingIndex > -1) {
      newCart = [...cart];
      newCart[existingIndex].qty += qty;
    } else {
      newCart = [...cart, { ...dish, qty }];
    }
    saveCart(newCart);
    showToast(`Added ${dish.name} to cart!`, 'success');
  };

  const updateCartQty = (dishId, delta) => {
    const newCart = cart.map(item => {
      if (item.id === dishId) {
        return { ...item, qty: item.qty + delta };
      }
      return item;
    }).filter(item => item.qty > 0);
    saveCart(newCart);
  };

  const removeFromCart = (dishId) => {
    const newCart = cart.filter(item => item.id !== dishId);
    saveCart(newCart);
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Order Placement
  const placeOrder = async ({ orderType = 'Dine-in', tableId = 'T3', discount = 0 }) => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    const total = Math.max(0, subtotal + tax - discount);

    const newOrder = {
      orderId: 'ORD' + Math.floor(1000 + Math.random() * 9000),
      customerId: currentUser?.id || 'U003',
      customerName: currentUser?.name || 'Valued Customer',
      items: cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty })),
      orderType,
      tableId: orderType === 'Dine-in' ? tableId : '',
      subtotal,
      tax,
      discount,
      total,
      status: 'Placed',
      createdAt: new Date().toISOString()
    };

    const updatedOrders = [newOrder, ...(db.orders || [])];
    await updateDbKey('orders', updatedOrders);

    // If dine-in, mark table occupied
    if (orderType === 'Dine-in' && tableId) {
      const updatedTables = (db.tables || []).map(t => 
        t.number === tableId || t.id === tableId ? { ...t, status: 'Occupied' } : t
      );
      await updateDbKey('tables', updatedTables);
    }

    clearCart();
    showToast(`Order #${newOrder.orderId} placed successfully!`, 'success');
    return newOrder;
  };

  // Status progression (Kitchen)
  const updateOrderStatus = async (orderId, newStatus) => {
    const updated = (db.orders || []).map(order => 
      order.orderId === orderId ? { ...order, status: newStatus } : order
    );
    await updateDbKey('orders', updated);
    showToast(`Order #${orderId} set to ${newStatus}`, 'info');
  };

  // Table reservation
  const bookTable = async ({ tableId, date, timeSlot, guests }) => {
    const newReservation = {
      reservationId: 'RES' + Math.floor(1000 + Math.random() * 9000),
      customerId: currentUser?.id || 'U003',
      customerName: currentUser?.name || 'Valued Customer',
      date,
      timeSlot,
      guests: Number(guests),
      tableId,
      status: 'Confirmed'
    };

    const updatedRes = [newReservation, ...(db.reservations || [])];
    await updateDbKey('reservations', updatedRes);

    const updatedTables = (db.tables || []).map(t => 
      t.id === tableId || t.number === tableId ? { ...t, status: 'Reserved' } : t
    );
    await updateDbKey('tables', updatedTables);

    showToast(`Table ${tableId} reserved for ${date} (${timeSlot})!`, 'success');
    return newReservation;
  };

  // Service requests
  const submitServiceRequest = async (tableId, type) => {
    const newReq = {
      requestId: 'REQ' + Math.floor(1000 + Math.random() * 9000),
      tableId,
      type,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    const updated = [newReq, ...(db.serviceRequests || [])];
    await updateDbKey('serviceRequests', updated);
    showToast(`Assistance requested: ${type} for Table ${tableId}`, 'success');
  };

  const resolveServiceRequest = async (requestId, status = 'Completed') => {
    const updated = (db.serviceRequests || []).map(req => 
      req.requestId === requestId ? { ...req, status } : req
    );
    await updateDbKey('serviceRequests', updated);
    showToast(`Request #${requestId} ${status.toLowerCase()}`, 'info');
  };

  return (
    <RestaurantContext.Provider value={{
      db,
      menuItems: db.menuItems || [],
      tables: db.tables || [],
      orders: db.orders || [],
      reservations: db.reservations || [],
      serviceRequests: db.serviceRequests || [],
      currentUser,
      setCurrentUser,
      cart,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      placeOrder,
      updateOrderStatus,
      bookTable,
      submitServiceRequest,
      resolveServiceRequest,
      syncStatus,
      toast,
      showToast
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
