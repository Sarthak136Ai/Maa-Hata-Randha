import React, { useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { IndianRupee, ShoppingBag, Users, Sparkles, TrendingUp, Award, Clock } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { orders, menuItems, tables, reservations } = useRestaurant();

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || o.subtotal || 0), 0);
    const totalOrdersCount = orders.length;
    const occupiedTables = tables.filter(t => t.status === 'Occupied').length;
    const totalDinePoints = Math.round(totalRevenue * 0.1);

    // Sales by Category
    const catSales = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const dish = menuItems.find(m => m.id === item.id);
        const cat = dish ? dish.category : 'Specialties';
        catSales[cat] = (catSales[cat] || 0) + (item.price * item.qty);
      });
    });

    // Top Selling Dishes
    const dishCounts = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        dishCounts[item.name] = (dishCounts[item.name] || 0) + item.qty;
      });
    });

    const topDishes = Object.keys(dishCounts)
      .map(name => ({ name, count: dishCounts[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrdersCount,
      occupiedTables,
      totalDinePoints,
      catSales,
      topDishes
    };
  }, [orders, menuItems, tables]);

  return (
    <div className="analytics-react-deck">
      {/* 4 KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon-box bg-primary-light">
            <IndianRupee size={24} color="var(--primary)" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Today's Total Sales</span>
            <h2 className="kpi-value">₹{metrics.totalRevenue.toLocaleString()}</h2>
            <span className="kpi-trend positive"><TrendingUp size={14} /> +18.4% vs last week</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-box bg-success-light">
            <ShoppingBag size={24} color="var(--success)" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Completed Orders</span>
            <h2 className="kpi-value">{metrics.totalOrdersCount}</h2>
            <span className="kpi-trend positive"><TrendingUp size={14} /> All channels active</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-box bg-warning-light">
            <Users size={24} color="var(--warning)" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Floor Occupancy</span>
            <h2 className="kpi-value">{metrics.occupiedTables} / {tables.length}</h2>
            <span className="kpi-subtext">Dining tables active</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon-box bg-purple-light">
            <Sparkles size={24} color="#8854d0" />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Dine Points Issued</span>
            <h2 className="kpi-value">{metrics.totalDinePoints}</h2>
            <span className="kpi-subtext">Loyalty program active</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Rankings */}
      <div className="analytics-content-grid">
        {/* Category Revenue Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Category Revenue Share</h3>
          <div className="cat-bars-list">
            {Object.keys(metrics.catSales).length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No sales recorded yet.</p>
            ) : (
              Object.entries(metrics.catSales).map(([cat, amount]) => {
                const maxSales = Math.max(...Object.values(metrics.catSales), 1);
                const pct = Math.round((amount / maxSales) * 100);

                return (
                  <div key={cat} className="cat-bar-item">
                    <div className="cat-bar-label-row">
                      <strong>{cat}</strong>
                      <span>₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Selling Dishes Ranking */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="flex justify-between align-center" style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Top Selling Dishes</h3>
            <Award size={20} color="var(--primary)" />
          </div>
          
          <div className="top-dishes-ranking">
            {metrics.topDishes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No dish orders recorded yet.</p>
            ) : (
              metrics.topDishes.map((dish, idx) => (
                <div key={dish.name} className="rank-row">
                  <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                  <div className="dish-name-cell">
                    <strong>{dish.name}</strong>
                  </div>
                  <span className="badge badge-primary">{dish.count} ordered</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
