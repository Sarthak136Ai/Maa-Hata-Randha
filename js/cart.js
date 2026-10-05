// Cart System Helper Operations

function getCart(userId) {
    return JSON.parse(localStorage.getItem('cart_' + userId)) || [];
}

function saveCart(userId, cart) {
    localStorage.setItem('cart_' + userId, JSON.stringify(cart));
}

function clearCart(userId) {
    localStorage.removeItem('cart_' + userId);
}

function calculateCartTotals(cart, couponCode = "") {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    
    let discount = 0;
    if (couponCode.toUpperCase() === 'GUSTOFEST') {
        discount = Math.round(subtotal * 0.15); // 15% discount
    }
    
    const total = Math.max(0, subtotal + tax - discount);
    
    return {
        subtotal,
        tax,
        discount,
        total
    };
}
