// Table Reservation System Engine

// Time slots options
const RESERVATION_SLOTS = [
    "12:00-14:00",
    "14:00-16:00",
    "16:00-18:00",
    "18:00-20:00",
    "20:00-22:00"
];

function checkTableAvailability(tableId, date, timeSlot) {
    const reservations = dbGet('reservations');
    
    // Find if there is a Confirmed reservation for this table, date, and time slot
    const match = reservations.find(res => 
        res.tableId === tableId && 
        res.date === date && 
        res.timeSlot === timeSlot && 
        res.status === 'Confirmed'
    );
    
    return !match; // Available if no conflicting reservation is found
}

function getReservedTables(date, timeSlot) {
    const reservations = dbGet('reservations');
    return reservations
        .filter(res => res.date === date && res.timeSlot === timeSlot && res.status === 'Confirmed')
        .map(res => res.tableId);
}

function submitNewReservation(userId, userName, reservationDetails) {
    const reservations = dbGet('reservations');
    const newId = "RES" + Math.floor(1000 + Math.random() * 9000);
    
    // Check double booking before saving
    const isAvailable = checkTableAvailability(
        reservationDetails.tableId,
        reservationDetails.date,
        reservationDetails.timeSlot
    );
    
    if (!isAvailable) {
        return { success: false, message: "This table was just reserved by someone else. Please choose another table." };
    }
    
    const newReservation = {
        reservationId: newId,
        customerId: userId,
        customerName: userName,
        date: reservationDetails.date,
        timeSlot: reservationDetails.timeSlot,
        guests: parseInt(reservationDetails.guests),
        tableId: reservationDetails.tableId,
        status: "Confirmed"
    };
    
    reservations.push(newReservation);
    dbSet('reservations', reservations);
    
    return { success: true, reservation: newReservation };
}
