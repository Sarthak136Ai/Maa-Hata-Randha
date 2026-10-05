// Admin Operations Script

// 1. Menu Management CRUD
function adminAddMenuItem(dish) {
    const menu = dbGet('menuItems');
    const newId = "M" + Math.floor(1000 + Math.random() * 9000);
    
    const newItem = {
        id: newId,
        name: dish.name,
        category: dish.category,
        description: dish.description,
        price: parseFloat(dish.price),
        rating: 5.0, // Default for new dishes
        isVeg: dish.isVeg,
        image: dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
        available: dish.available
    };
    
    menu.push(newItem);
    dbSet('menuItems', menu);
    return { success: true, item: newItem };
}

function adminEditMenuItem(id, updatedFields) {
    const menu = dbGet('menuItems');
    const idx = menu.findIndex(item => item.id === id);
    
    if (idx === -1) return { success: false, message: "Item not found." };
    
    menu[idx] = { ...menu[idx], ...updatedFields };
    dbSet('menuItems', menu);
    return { success: true, item: menu[idx] };
}

function adminDeleteMenuItem(id) {
    let menu = dbGet('menuItems');
    const originalLength = menu.length;
    menu = menu.filter(item => item.id !== id);
    
    if (menu.length === originalLength) return { success: false, message: "Item not found." };
    
    dbSet('menuItems', menu);
    return { success: true };
}

// 2. Table Management CRUD
function adminAddTable(table) {
    const tables = dbGet('tables');
    const newId = "T" + Math.floor(1000 + Math.random() * 9000);
    
    const newTable = {
        id: newId,
        number: table.number,
        capacity: parseInt(table.capacity),
        section: table.section,
        shape: table.shape,
        status: table.status,
        x: table.x || 100,
        y: table.y || 100
    };
    
    tables.push(newTable);
    dbSet('tables', tables);
    return { success: true, table: newTable };
}

function adminEditTable(id, updatedFields) {
    const tables = dbGet('tables');
    const idx = tables.findIndex(t => t.id === id);
    
    if (idx === -1) return { success: false, message: "Table not found." };
    
    tables[idx] = { ...tables[idx], ...updatedFields };
    dbSet('tables', tables);
    return { success: true, table: tables[idx] };
}

function adminDeleteTable(id) {
    let tables = dbGet('tables');
    const originalLength = tables.length;
    tables = tables.filter(t => t.id !== id);
    
    if (tables.length === originalLength) return { success: false, message: "Table not found." };
    
    dbSet('tables', tables);
    return { success: true };
}

// 3. Staff Management CRUD
function adminAddStaff(staff) {
    const users = dbGet('users');
    const newId = "U" + Math.floor(1000 + Math.random() * 9000);
    
    const newStaff = {
        id: newId,
        name: staff.name,
        email: staff.email,
        password: staff.password,
        role: "staff",
        staffRole: staff.staffRole
    };
    
    users.push(newStaff);
    dbSet('users', users);
    return { success: true, staff: newStaff };
}

function adminEditStaff(id, updatedFields) {
    const users = dbGet('users');
    const idx = users.findIndex(u => u.id === id);
    
    if (idx === -1) return { success: false, message: "User not found." };
    
    users[idx] = { ...users[idx], ...updatedFields };
    dbSet('users', users);
    return { success: true, user: users[idx] };
}

function adminDeleteStaff(id) {
    let users = dbGet('users');
    const originalLength = users.length;
    users = users.filter(u => u.id !== id);
    
    if (users.length === originalLength) return { success: false, message: "User not found." };
    
    dbSet('users', users);
    return { success: true };
}
