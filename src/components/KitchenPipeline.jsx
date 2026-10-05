import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { ChefHat, Clock, CheckCircle2, PlayCircle, Bell, UtensilsCrossed, AlertCircle } from 'lucide-react';

const STAGES = [
  { id: 'Placed', label: '1. New Placed', color: '#ff4757', next: 'Accepted', btnText: 'Accept Order', icon: Bell },
  { id: 'Accepted', label: '2. Accepted', color: '#ffa502', next: 'Preparing', btnText: 'Start Cooking', icon: ChefHat },
  { id: 'Preparing', label: '3. Cooking', color: '#3742fa', next: 'Ready', btnText: 'Mark Ready', icon: PlayCircle },
  { id: 'Ready', label: '4. Ready to Serve', color: '#2ed573', next: 'Served', btnText: 'Serve to Table', icon: CheckCircle2 },
  { id: 'Served', label: '5. Served / Done', color: '#747d8c', next: null, btnText: null, icon: UtensilsCrossed }
];

export default function KitchenPipeline() {
  const { orders, updateOrderStatus } = useRestaurant();
  const [activeFilter, setActiveFilter] = useState('All');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getOrdersForStage = (stageId) => {
    return orders.filter(o => (o.status || 'Placed') === stageId);
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff === 1) return '1 min ago';
    return `${diff} mins ago`;
  };

  return (
    <div className="kitchen-pipeline-react-container">
      {/* Header Deck */}
      <div className="pipeline-header card">
        <div className="flex align-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="flex align-center" style={{ gap: '12px' }}>
            <div className="kds-badge">
              <ChefHat size={24} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Live Kitchen Order Pipeline (KDS)</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
                Real-time order stage tracker with instant chef status updates
              </p>
            </div>
          </div>

          <div className="flex align-center" style={{ gap: '12px' }}>
            <button 
              className={`btn btn-sm ${soundEnabled ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              <Bell size={14} style={{ marginRight: '6px' }} />
              {soundEnabled ? 'Chime Alerts: ON' : 'Chime Alerts: OFF'}
            </button>
            <span className="badge badge-success" style={{ padding: '8px 12px' }}>
              ● Live Sync Connected
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="kanban-pipeline-grid">
        {STAGES.map(stage => {
          const stageOrders = getOrdersForStage(stage.id);
          const StageIcon = stage.icon;

          return (
            <div key={stage.id} className="kanban-column">
              <div className="column-header" style={{ borderTop: `3px solid ${stage.color}` }}>
                <div className="flex align-center" style={{ gap: '8px' }}>
                  <StageIcon size={16} color={stage.color} />
                  <span className="column-title">{stage.label}</span>
                </div>
                <span className="order-counter-badge" style={{ backgroundColor: stage.color }}>
                  {stageOrders.length}
                </span>
              </div>

              <div className="column-card-list">
                {stageOrders.length === 0 ? (
                  <div className="empty-column-state">
                    <span>No active orders</span>
                  </div>
                ) : (
                  stageOrders.map(order => (
                    <div key={order.orderId} className="kanban-order-card">
                      <div className="card-top-row">
                        <span className="order-number">#{order.orderId}</span>
                        <span className="order-time">
                          <Clock size={12} /> {getTimeAgo(order.createdAt)}
                        </span>
                      </div>

                      <div className="order-dest-row">
                        <span className={`badge ${order.orderType === 'Dine-in' ? 'badge-primary' : 'badge-warning'}`}>
                          {order.orderType === 'Dine-in' ? `Table ${order.tableId || 'T3'}` : 'Takeaway'}
                        </span>
                        <span className="customer-name">{order.customerName || 'Valued Guest'}</span>
                      </div>

                      {/* Items */}
                      <div className="card-items-box">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="order-dish-item">
                            <span className="item-qty-tag">{item.qty}x</span>
                            <span className="item-name-text">{item.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="card-bottom-row">
                        <strong className="order-bill-amount">₹{order.total || order.subtotal || 0}</strong>
                        
                        {stage.next && (
                          <button 
                            className="btn btn-primary btn-sm btn-advance-order"
                            onClick={() => updateOrderStatus(order.orderId, stage.next)}
                          >
                            <span>{stage.btnText}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
