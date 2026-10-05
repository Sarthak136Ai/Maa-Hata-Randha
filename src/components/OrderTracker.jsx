import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Clock, CheckCircle2, ChefHat, PlayCircle, UtensilsCrossed, Bell } from 'lucide-react';
import ServiceRequests from './ServiceRequests';

const STEPS = [
  { key: 'Placed', label: 'Order Placed', icon: Clock },
  { key: 'Accepted', label: 'Order Accepted', icon: ChefHat },
  { key: 'Preparing', label: 'Chef Cooking', icon: PlayCircle },
  { key: 'Ready', label: 'Ready for Table', icon: CheckCircle2 },
  { key: 'Served', label: 'Served & Enjoying', icon: UtensilsCrossed }
];

export default function OrderTracker() {
  const { orders, currentUser } = useRestaurant();

  // Get current user orders or all orders
  const userOrders = orders.filter(o => 
    !currentUser || o.customerId === currentUser.id || o.customerName === currentUser.name
  );

  const activeOrders = userOrders.length > 0 ? userOrders : orders;

  const getStepIndex = (status) => {
    const idx = STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="order-tracker-react-container">
      {/* Table Assistance Module */}
      <ServiceRequests isCustomer={true} />

      <h3 style={{ marginTop: '28px', marginBottom: '16px' }}>Your Active Food Orders</h3>

      {activeOrders.length === 0 ? (
        <div className="card empty-orders-card" style={{ padding: '40px', textAlign: 'center' }}>
          <UtensilsCrossed size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h4>No active orders currently placed</h4>
          <p style={{ color: 'var(--text-muted)' }}>Browse our digital menu to place your first delectable order.</p>
        </div>
      ) : (
        <div className="active-orders-grid">
          {activeOrders.map(order => {
            const currentStepIdx = getStepIndex(order.status);

            return (
              <div key={order.orderId} className="card live-order-card">
                <div className="order-card-header flex justify-between align-center">
                  <div>
                    <span className="order-badge-id">Order #{order.orderId}</span>
                    <span className="order-type-badge">{order.orderType} • Table {order.tableId || 'T3'}</span>
                  </div>
                  <strong className="order-header-total">₹{order.total || order.subtotal}</strong>
                </div>

                {/* Progress Step Bar */}
                <div className="tracker-timeline-bar">
                  <div className="tracker-steps-row">
                    {STEPS.map((step, idx) => {
                      const isPast = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      const StepIcon = step.icon;

                      return (
                        <div 
                          key={step.key} 
                          className={`step-node ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''}`}
                        >
                          <div className="step-circle">
                            <StepIcon size={16} />
                          </div>
                          <span className="step-label">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-items-summary">
                  <span className="summary-title">Items Ordered:</span>
                  <div className="order-items-tags">
                    {(order.items || []).map((item, i) => (
                      <span key={i} className="item-order-tag">
                        {item.qty}x {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
