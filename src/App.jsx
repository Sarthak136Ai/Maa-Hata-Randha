import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import DigitalMenu from './components/DigitalMenu';
import LiveCart from './components/LiveCart';
import TableReservation from './components/TableReservation';
import KitchenPipeline from './components/KitchenPipeline';
import ServiceRequests from './components/ServiceRequests';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import OrderTracker from './components/OrderTracker';
import { 
  Utensils, 
  ShoppingCart, 
  Calendar, 
  ChefHat, 
  Bell, 
  BarChart3, 
  Clock, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import './index.css';

function MainApp() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'reservation', 'kitchen', 'requests', 'analytics', 'tracker'
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, toast, currentUser } = useRestaurant();

  const totalCartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="react-app-root">
      {/* Top Navbar */}
      <header className="react-navbar">
        <div className="nav-container">
          <div className="brand-box">
            <div className="brand-logo-icon">
              <Utensils size={22} color="#fff" />
            </div>
            <div className="brand-texts">
              <h2 className="brand-title">Maa Hata<span>Randha</span></h2>
              <span className="brand-tagline">Smart Restaurant & Management Suite</span>
            </div>
            <span className="react-badge">
              <Sparkles size={12} /> React + HMR
            </span>
          </div>

          {/* Navigation Module Tabs */}
          <nav className="nav-tabs-deck">
            <button 
              className={`nav-tab-item ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              <Utensils size={16} />
              <span>Digital Menu</span>
            </button>
            <button 
              className={`nav-tab-item ${activeTab === 'reservation' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservation')}
            >
              <Calendar size={16} />
              <span>Table Booking</span>
            </button>
            <button 
              className={`nav-tab-item ${activeTab === 'tracker' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracker')}
            >
              <Clock size={16} />
              <span>Order Tracker</span>
            </button>
            <button 
              className={`nav-tab-item ${activeTab === 'kitchen' ? 'active' : ''}`}
              onClick={() => setActiveTab('kitchen')}
            >
              <ChefHat size={16} />
              <span>Kitchen Pipeline</span>
            </button>
            <button 
              className={`nav-tab-item ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <Bell size={16} />
              <span>Assistance Calls</span>
            </button>
            <button 
              className={`nav-tab-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={16} />
              <span>Admin Analytics</span>
            </button>
          </nav>

          {/* Right Action Deck */}
          <div className="nav-actions">
            <button className="btn-cart-nav" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={18} />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="cart-counter-pill">{totalCartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="main-viewport">
        <div className="content-container">
          {activeTab === 'menu' && <DigitalMenu onOpenCart={() => setIsCartOpen(true)} />}
          {activeTab === 'reservation' && <TableReservation />}
          {activeTab === 'tracker' && <OrderTracker />}
          {activeTab === 'kitchen' && <KitchenPipeline />}
          {activeTab === 'requests' && <ServiceRequests isCustomer={false} />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </div>
      </main>

      {/* Slide-out Cart Drawer */}
      <LiveCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onOrderPlaced={() => setActiveTab('tracker')}
      />

      {/* Global Toast Notification */}
      {toast && (
        <div className={`react-toast-bubble toast-${toast.type}`}>
          <Sparkles size={16} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <MainApp />
    </RestaurantProvider>
  );
}
