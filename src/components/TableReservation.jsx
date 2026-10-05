import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Calendar, Clock, Users, CheckCircle, MapPin, Sparkles } from 'lucide-react';

const TIME_SLOTS = [
  '12:00-14:00',
  '14:00-16:00',
  '18:00-20:00',
  '19:00-21:00',
  '20:00-22:00',
  '21:00-23:00'
];

export default function TableReservation() {
  const { tables, reservations, bookTable, currentUser } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[3]);
  const [guestCount, setGuestCount] = useState(2);
  const [sectionFilter, setSectionFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Check if a table is reserved for the selected date & slot
  const isTableReserved = (tableId) => {
    return reservations.some(res => 
      (res.tableId === tableId || res.tableId === `T${tableId}`) && 
      res.date === selectedDate && 
      res.timeSlot === selectedSlot && 
      res.status === 'Confirmed'
    );
  };

  const sections = ['All', 'Window Area', 'Main Dining Area', 'Outdoor Seating', 'VIP Section'];

  const filteredTables = tables.filter(t => {
    if (sectionFilter !== 'All' && t.section !== sectionFilter) return false;
    return true;
  });

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedTable) return;

    if (guestCount > selectedTable.capacity) {
      alert(`Warning: This table has a maximum seating capacity of ${selectedTable.capacity} guests.`);
    }

    setIsSubmitting(true);
    try {
      const res = await bookTable({
        tableId: selectedTable.number,
        date: selectedDate,
        timeSlot: selectedSlot,
        guests: guestCount
      });
      setConfirmedBooking(res);
      setSelectedTable(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reservation-react-container">
      <div className="reservation-grid">
        {/* Left Side: Interactive Floor Seating Plan */}
        <div className="card floor-plan-card">
          <div className="floor-plan-header">
            <div>
              <h3>Interactive Dining Seating Plan</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                Select a table to reserve your premium dining spot
              </p>
            </div>

            {/* Section Tabs */}
            <div className="section-tabs">
              {sections.map(sec => (
                <button
                  key={sec}
                  className={`section-tab-btn ${sectionFilter === sec ? 'active' : ''}`}
                  onClick={() => setSectionFilter(sec)}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="floor-legend">
            <div className="legend-item"><span className="legend-dot available"></span> Available</div>
            <div className="legend-item"><span className="legend-dot selected"></span> Selected</div>
            <div className="legend-item"><span className="legend-dot reserved"></span> Reserved / Slot Booked</div>
            <div className="legend-item"><span className="legend-dot occupied"></span> Dining Occupied</div>
          </div>

          {/* Floor Canvas Layout */}
          <div className="interactive-floor-stage">
            <div className="restaurant-focal-point">
              <span>🌟 MAIN ORCHESTRA & SERVING COUNTER 🌟</span>
            </div>

            <div className="tables-canvas-grid">
              {filteredTables.map(t => {
                const reserved = isTableReserved(t.id) || isTableReserved(t.number);
                const occupied = t.status === 'Occupied';
                const isSelected = selectedTable?.id === t.id;

                let tableState = 'available';
                if (isSelected) tableState = 'selected';
                else if (occupied) tableState = 'occupied';
                else if (reserved) tableState = 'reserved';

                return (
                  <div 
                    key={t.id}
                    className={`visual-table-node shape-${t.shape || 'square'} state-${tableState} ${t.capacity >= 6 ? 'large' : ''}`}
                    onClick={() => {
                      if (!reserved && !occupied) {
                        setSelectedTable(t);
                      }
                    }}
                  >
                    <div className="table-top">
                      <span className="table-num">{t.number}</span>
                      <span className="table-seats">{t.capacity} Seats</span>
                    </div>
                    <span className="table-sec-tag">{t.section}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="card booking-form-card">
          <h3>Table Reservation Details</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            Instant reservation confirmation with zero pre-booking fees
          </p>

          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label className="form-label"><Calendar size={14} /> Reservation Date</label>
              <input 
                type="date" 
                className="form-control"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Clock size={14} /> Dining Time Slot</label>
              <select 
                className="form-control"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                {TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label"><Users size={14} /> Number of Guests</label>
              <div className="guest-stepper">
                {[1, 2, 4, 6, 8, 10].map(num => (
                  <button
                    type="button"
                    key={num}
                    className={`guest-pill ${guestCount === num ? 'active' : ''}`}
                    onClick={() => setGuestCount(num)}
                  >
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Table Summary */}
            <div className="selected-table-preview">
              {selectedTable ? (
                <div className="table-preview-box">
                  <div className="preview-row">
                    <span>Selected Table:</span>
                    <strong>Table {selectedTable.number} ({selectedTable.section})</strong>
                  </div>
                  <div className="preview-row">
                    <span>Capacity:</span>
                    <span>{selectedTable.capacity} Persons Max</span>
                  </div>
                  <div className="preview-row">
                    <span>Shape & Ambience:</span>
                    <span style={{ textTransform: 'capitalize' }}>{selectedTable.shape} Table Layout</span>
                  </div>
                </div>
              ) : (
                <div className="no-table-selected-alert">
                  <MapPin size={20} color="var(--primary)" />
                  <span>Please click on an available green table from the floor layout.</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-submit-res"
              disabled={!selectedTable || isSubmitting}
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            >
              <CheckCircle size={18} style={{ marginRight: '8px' }} />
              {isSubmitting ? 'Confirming...' : 'Confirm Table Booking'}
            </button>
          </form>

          {/* Confirmed Booking Modal */}
          {confirmedBooking && (
            <div className="booking-modal-overlay" onClick={() => setConfirmedBooking(null)}>
              <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="success-icon-badge">
                  <Sparkles size={32} color="#fff" />
                </div>
                <h2>Table Reserved Successfully!</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                  Your booking code is <strong>#{confirmedBooking.reservationId}</strong>
                </p>

                <div className="booking-receipt">
                  <div className="receipt-line">
                    <span>Reserved For:</span>
                    <strong>{confirmedBooking.customerName}</strong>
                  </div>
                  <div className="receipt-line">
                    <span>Table Number:</span>
                    <strong>{confirmedBooking.tableId}</strong>
                  </div>
                  <div className="receipt-line">
                    <span>Date:</span>
                    <span>{confirmedBooking.date}</span>
                  </div>
                  <div className="receipt-line">
                    <span>Time Slot:</span>
                    <span>{confirmedBooking.timeSlot}</span>
                  </div>
                  <div className="receipt-line">
                    <span>Party Size:</span>
                    <span>{confirmedBooking.guests} Guests</span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  onClick={() => setConfirmedBooking(null)}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
