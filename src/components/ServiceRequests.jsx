import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Bell, Droplets, Receipt, CheckCircle, Clock, UserCheck } from 'lucide-react';

export default function ServiceRequests({ isCustomer = false }) {
  const { serviceRequests, submitServiceRequest, resolveServiceRequest, tables } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState('T3');

  const pendingRequests = serviceRequests.filter(r => r.status !== 'Completed');
  const completedRequests = serviceRequests.filter(r => r.status === 'Completed').slice(0, 5);

  const getIcon = (type) => {
    if (type.includes('Water')) return <Droplets size={16} color="#3742fa" />;
    if (type.includes('Bill')) return <Receipt size={16} color="#2ed573" />;
    return <Bell size={16} color="#ff4757" />;
  };

  return (
    <div className="service-requests-container">
      {/* Customer Quick Assistance Calling Deck */}
      {isCustomer ? (
        <div className="card customer-assistance-card">
          <div className="flex justify-between align-center" style={{ marginBottom: '16px' }}>
            <div className="flex align-center" style={{ gap: '10px' }}>
              <div className="icon-badge-pulse">
                <Bell size={20} color="var(--primary)" />
              </div>
              <div>
                <h4 style={{ margin: 0 }}>Instant Table Assistance</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
                  Tap below to notify the floor captain immediately
                </p>
              </div>
            </div>

            <div className="flex align-center" style={{ gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Your Table:</label>
              <select 
                value={selectedTable} 
                onChange={(e) => setSelectedTable(e.target.value)}
                className="form-control"
                style={{ width: '90px', padding: '6px' }}
              >
                {tables.map(t => (
                  <option key={t.id} value={t.number}>{t.number}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="assistance-action-grid">
            <button 
              className="assistance-btn btn-call-waiter"
              onClick={() => submitServiceRequest(selectedTable, 'Call Waiter')}
            >
              <Bell size={22} />
              <strong>Call Waiter</strong>
              <span>Request floor staff</span>
            </button>

            <button 
              className="assistance-btn btn-call-water"
              onClick={() => submitServiceRequest(selectedTable, 'Need Fresh Water')}
            >
              <Droplets size={22} />
              <strong>Need Water</strong>
              <span>Water refill request</span>
            </button>

            <button 
              className="assistance-btn btn-call-bill"
              onClick={() => submitServiceRequest(selectedTable, 'Request Final Bill')}
            >
              <Receipt size={22} />
              <strong>Request Bill</strong>
              <span>Prepare dining bill</span>
            </button>
          </div>
        </div>
      ) : (
        /* Staff Live Request Processing Board */
        <div className="staff-request-deck">
          <div className="card" style={{ padding: '20px' }}>
            <div className="flex justify-between align-center" style={{ marginBottom: '16px' }}>
              <div className="flex align-center" style={{ gap: '10px' }}>
                <Bell size={20} color="var(--danger)" />
                <h3 style={{ margin: 0 }}>Live Guest Assistance Queue</h3>
              </div>
              <span className="badge badge-danger">
                {pendingRequests.length} Pending Calls
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="empty-requests-banner">
                <CheckCircle size={36} color="var(--success)" style={{ marginBottom: '8px' }} />
                <h4>All tables are happily attended!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  New assistance calls will flash here with live chime notifications.
                </p>
              </div>
            ) : (
              <div className="requests-table-container">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>Table</th>
                      <th>Request Type</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map(req => (
                      <tr key={req.requestId} className="request-row pending">
                        <td><strong className="badge badge-primary">Table {req.tableId}</strong></td>
                        <td>
                          <div className="flex align-center" style={{ gap: '8px' }}>
                            {getIcon(req.type)}
                            <strong>{req.type}</strong>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            <Clock size={12} /> {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${req.status === 'In Progress' ? 'badge-warning' : 'badge-danger'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex" style={{ gap: '8px' }}>
                            {req.status === 'Pending' && (
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => resolveServiceRequest(req.requestId, 'In Progress')}
                              >
                                Accept Call
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => resolveServiceRequest(req.requestId, 'Completed')}
                            >
                              <CheckCircle size={14} style={{ marginRight: '4px' }} /> Mark Resolved
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
