// Staff Operations Script

function changeOrderStatus(orderId, newStatus) {
    const orders = dbGet('orders');
    const orderIdx = orders.findIndex(o => o.orderId === orderId);
    
    if (orderIdx === -1) {
        return { success: false, message: "Order not found." };
    }
    
    orders[orderIdx].status = newStatus;
    dbSet('orders', orders);
    return { success: true, order: orders[orderIdx] };
}

function changeRequestStatus(requestId, newStatus) {
    const requests = dbGet('serviceRequests');
    const reqIdx = requests.findIndex(r => r.requestId === requestId);
    
    if (reqIdx === -1) {
        return { success: false, message: "Service request not found." };
    }
    
    requests[reqIdx].status = newStatus;
    dbSet('serviceRequests', requests);
    return { success: true, request: requests[reqIdx] };
}
