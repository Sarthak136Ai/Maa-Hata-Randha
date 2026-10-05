import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Search, Star, Plus, Minus, ShoppingCart, Check, Eye } from 'lucide-react';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Biryani', 'Fast Foods', 'Desserts', 'Beverages'];

export default function DigitalMenu({ onOpenCart }) {
  const { menuItems, cart, addToCart, updateCartQty } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dietFilter, setDietFilter] = useState('all'); // 'all', 'veg', 'nonveg'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [previewDish, setPreviewDish] = useState(null);

  const filteredDishes = useMemo(() => {
    return menuItems.filter(dish => {
      // Category match
      if (selectedCategory !== 'All' && dish.category !== selectedCategory) {
        return false;
      }
      // Diet match
      if (dietFilter === 'veg' && !dish.isVeg) return false;
      if (dietFilter === 'nonveg' && dish.isVeg) return false;
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(q);
        const matchesDesc = (dish.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [menuItems, selectedCategory, dietFilter, searchQuery, sortBy]);

  const getCartQty = (dishId) => {
    const item = cart.find(i => i.id === dishId);
    return item ? item.qty : 0;
  };

  const totalCartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="react-menu-container">
      {/* Top Header & Search Deck */}
      <div className="menu-header-deck">
        <div className="search-sort-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search flavorful dishes, biryanis, rolls..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>&times;</button>
            )}
          </div>

          <div className="sort-wrapper">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Featured / Recommended</option>
              <option value="rating-desc">Highest Rated ⭐</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {onOpenCart && (
            <button className="cart-floating-btn" onClick={onOpenCart}>
              <ShoppingCart size={18} />
              <span>Cart ({totalCartCount})</span>
            </button>
          )}
        </div>

        {/* Category Pills & Diet Filter */}
        <div className="category-deck">
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="diet-toggles">
            <button 
              className={`diet-pill ${dietFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDietFilter('all')}
            >
              All Diets
            </button>
            <button 
              className={`diet-pill veg ${dietFilter === 'veg' ? 'active' : ''}`}
              onClick={() => setDietFilter('veg')}
            >
              🌱 Pure Veg
            </button>
            <button 
              className={`diet-pill nonveg ${dietFilter === 'nonveg' ? 'active' : ''}`}
              onClick={() => setDietFilter('nonveg')}
            >
              🍗 Non-Veg
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Dishes */}
      <div className="menu-grid">
        {filteredDishes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No dishes found matching your selection</h3>
            <p>Try clearing your search query or selecting another category.</p>
            <button 
              className="btn btn-primary"
              onClick={() => { setSelectedCategory('All'); setDietFilter('all'); setSearchQuery(''); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredDishes.map(dish => {
            const qty = getCartQty(dish.id);
            const isAvailable = dish.available !== false;

            return (
              <div key={dish.id} className={`dish-card ${!isAvailable ? 'sold-out' : ''}`}>
                <div className="dish-img-container">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className={`diet-tag ${dish.isVeg ? 'veg-tag' : 'nonveg-tag'}`}>
                    {dish.isVeg ? 'VEG' : 'NON-VEG'}
                  </span>
                  
                  {dish.rating && (
                    <span className="rating-tag">
                      <Star size={12} fill="#ffb800" stroke="#ffb800" />
                      <span>{dish.rating}</span>
                    </span>
                  )}

                  {!isAvailable && (
                    <div className="sold-out-overlay">
                      <span>Sold Out</span>
                    </div>
                  )}

                  <button 
                    className="quick-view-btn"
                    title="Quick Preview"
                    onClick={() => setPreviewDish(dish)}
                  >
                    <Eye size={16} />
                  </button>
                </div>

                <div className="dish-info">
                  <div className="dish-title-row">
                    <h4 className="dish-name">{dish.name}</h4>
                    <span className="dish-category-label">{dish.category}</span>
                  </div>
                  
                  <p className="dish-description">{dish.description}</p>
                  
                  <div className="dish-footer">
                    <div className="price-tag">
                      <span className="price-label">Price</span>
                      <strong className="price-amount">₹{dish.price}</strong>
                    </div>

                    <div className="action-box">
                      {!isAvailable ? (
                        <button className="btn btn-disabled" disabled>Unavailable</button>
                      ) : qty > 0 ? (
                        <div className="qty-stepper">
                          <button 
                            className="qty-btn"
                            onClick={() => updateCartQty(dish.id, -1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-value">{qty}</span>
                          <button 
                            className="qty-btn"
                            onClick={() => updateCartQty(dish.id, 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn-add-to-cart"
                          onClick={() => addToCart(dish.id)}
                        >
                          <Plus size={16} />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Preview Modal */}
      {previewDish && (
        <div className="dish-modal-backdrop" onClick={() => setPreviewDish(null)}>
          <div className="dish-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setPreviewDish(null)}>&times;</button>
            <div className="modal-dish-image">
              <img 
                src={previewDish.image} 
                alt={previewDish.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <span className={`diet-tag ${previewDish.isVeg ? 'veg-tag' : 'nonveg-tag'}`}>
                {previewDish.isVeg ? '100% VEGETARIAN' : 'NON-VEGETARIAN'}
              </span>
            </div>
            <div className="modal-dish-details">
              <div className="flex justify-between align-center">
                <span className="badge badge-primary">{previewDish.category}</span>
                <span className="rating-tag">
                  <Star size={14} fill="#ffb800" stroke="#ffb800" />
                  <strong>{previewDish.rating} / 5.0</strong>
                </span>
              </div>
              <h2 style={{ marginTop: '12px', marginBottom: '8px' }}>{previewDish.name}</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                {previewDish.description}
              </p>
              <div className="modal-footer flex justify-between align-center">
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Total Price</span>
                  <strong style={{ fontSize: '24px', color: 'var(--primary)' }}>₹{previewDish.price}</strong>
                </div>
                <button 
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', fontSize: '15px' }}
                  onClick={() => {
                    addToCart(previewDish.id);
                    setPreviewDish(null);
                  }}
                >
                  <ShoppingCart size={18} style={{ marginRight: '8px' }} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
