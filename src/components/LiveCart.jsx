import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Trash2, Plus, Minus, ArrowRight, Sparkles, Utensils, ShoppingBag, X } from 'lucide-react';

export default function LiveCart({ isOpen, onClose, onOrderPlaced }) {
  const { cart, updateCartQty, removeFromCart, clearCart, placeOrder, tables, currentUser } = useRestaurant();
  const [orderType, setOrderType] = useState('Dine-in');
  const [tableId, setTableId] = useState('T3');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.05);
  const finalTotal = Math.max(0, subtotal + tax - discountAmount);
  const earnedPoints = Math.round(finalTotal * 0.1);

  const applyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'MAAHATA10' || code === 'WELCOME10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      setAppliedCoupon({ code, text: '10% Discount Applied (-₹' + disc + ')' });
    } else if (code === 'GUSTOFEST' || code === 'FLAT50') {
      if (subtotal < 300) {
        setCouponError('Minimum order amount for ₹50 off is ₹300');
        return;
      }
      setDiscountAmount(50);
      setAppliedCoupon({ code, text: 'Flat ₹50 Festival Discount Applied' });
    } else {
      setCouponError('Invalid coupon code. Try MAAHATA10 or GUSTOFEST');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const order = await placeOrder({
        orderType,
        tableId: orderType === 'Dine-in' ? tableId : '',
        discount: discountAmount
      });
      if (order && onOrderPlaced) {
        onOrderPlaced(order);
      }
      if (onClose) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="flex align-center" style={{ gap: '10px' }}>
            <ShoppingBag size={22} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Active Dining Cart</h3>
            <span className="badge badge-primary">{cart.length} items</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <Utensils size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h4>Your cart is currently empty</h4>
              <p>Explore our menu and add your favorite dishes to begin your feast.</p>
              <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '16px' }}>
                Browse Delicious Dishes
              </button>
            </div>
          ) : (
            <>
              {/* Dining Mode Toggle */}
              <div className="order-type-selector">
                <button 
                  className={`type-option ${orderType === 'Dine-in' ? 'active' : ''}`}
                  onClick={() => setOrderType('Dine-in')}
                >
                  <Utensils size={16} />
                  <span>Dine-In Table</span>
                </button>
                <button 
                  className={`type-option ${orderType === 'Takeaway' ? 'active' : ''}`}
                  onClick={() => setOrderType('Takeaway')}
                >
                  <ShoppingBag size={16} />
                  <span>Takeaway / Parcel</span>
                </button>
              </div>

              {orderType === 'Dine-in' && (
                <div className="table-select-row">
                  <label>Selected Dining Table:</label>
                  <select 
                    value={tableId} 
                    onChange={(e) => setTableId(e.target.value)}
                    className="form-control"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.number}>
                        Table {t.number} ({t.section} • {t.capacity} Seats) - {t.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Items List */}
              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.id} className="cart-item-row">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="cart-item-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="cart-item-details">
                      <h5 className="cart-item-title">{item.name}</h5>
                      <span className="cart-item-unit-price">₹{item.price} each</span>
                    </div>

                    <div className="qty-stepper small">
                      <button className="qty-btn" onClick={() => updateCartQty(item.id, -1)}>
                        <Minus size={12} />
                      </button>
                      <span className="qty-value">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateCartQty(item.id, 1)}>
                        <Plus size={12} />
                      </button>
                    </div>

                    <strong className="cart-item-total-price">
                      ₹{item.price * item.qty}
                    </strong>

                    <button 
                      className="cart-delete-btn"
                      title="Remove item"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="coupon-card">
                <div className="coupon-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                    className="form-control"
                  />
                  {appliedCoupon ? (
                    <button className="btn btn-outline btn-sm" onClick={removeCoupon}>
                      Remove
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={applyCoupon}>
                      Apply
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="coupon-success-tag">
                    <Sparkles size={14} />
                    <span>{appliedCoupon.text}</span>
                  </div>
                )}
                {couponError && (
                  <span className="coupon-error-tag">{couponError}</span>
                )}
              </div>

              {/* Price Calculation Bill */}
              <div className="cart-summary-bill">
                <div className="bill-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal}</strong>
                </div>
                <div className="bill-row">
                  <span>GST (5%)</span>
                  <span>₹{tax}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="bill-row discount">
                    <span>Discount Applied</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="bill-row grand-total">
                  <span>Total Payable</span>
                  <strong>₹{finalTotal}</strong>
                </div>

                <div className="points-reward-banner">
                  <Sparkles size={16} color="var(--primary)" />
                  <span>You will earn <strong>+{earnedPoints} Dine Points</strong> on this order!</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Button */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <button 
              className="btn btn-primary btn-checkout"
              onClick={handleCheckout}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Placing Order...' : `Proceed to Order • ₹${finalTotal}`}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
