// Authentication Handlers

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Bind logout buttons across dashboards dynamically
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            // Check current page directory structure to redirect correctly
            if (window.location.pathname.includes('/customer/') || 
                window.location.pathname.includes('/staff/') || 
                window.location.pathname.includes('/admin/')) {
                window.location.href = '../login.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }
});

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showToast("Please enter both email and password.", "error");
        return;
    }
    
    const users = dbGet('users');
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!matchedUser) {
        showToast("Invalid email or password.", "error");
        return;
    }
    
    // Store session details
    localStorage.setItem('currentUser', JSON.stringify({
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        staffRole: matchedUser.staffRole || ""
    }));
    
    showToast(`Welcome back, ${matchedUser.name}!`, "success");
    
    // Redirect based on role
    setTimeout(() => {
        if (matchedUser.role === 'admin') {
            window.location.href = 'admin/dashboard.html';
        } else if (matchedUser.role === 'staff') {
            window.location.href = 'staff/dashboard.html';
        } else {
            window.location.href = 'customer/dashboard.html';
        }
    }, 1000);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showToast("All fields are required.", "error");
        return;
    }
    
    if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
    }
    
    const users = dbGet('users');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existing) {
        showToast("An account with this email already exists.", "error");
        return;
    }
    
    // Create new customer account
    const newUserId = "U" + Math.floor(1000 + Math.random() * 9000);
    const newCustomer = {
        id: newUserId,
        name: name,
        email: email,
        password: password,
        role: "customer"
    };
    
    users.push(newCustomer);
    dbSet('users', users);
    
    showToast("Registration successful! Redirecting to login...", "success");
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}
