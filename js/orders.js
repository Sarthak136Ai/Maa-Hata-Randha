// Order and Service Request Helpers

function submitServiceRequest(tableId, type) {
    const requests = dbGet('serviceRequests');
    const newId = "REQ" + Math.floor(1000 + Math.random() * 9000);
    
    const newRequest = {
        requestId: newId,
        tableId: tableId,
        type: type,
        status: "Pending",
        createdAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    dbSet('serviceRequests', requests);
    
    return newRequest;
}

function getActiveRequestsByTable(tableId) {
    const requests = dbGet('serviceRequests');
    return requests.filter(r => r.tableId === tableId && r.status !== 'Completed');
}
