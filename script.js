// Initial Configuration & Database Seed [cite: 1, 344]
const STORAGE_KEY = 'ipt_demo_v1';
let currentUser = null;

window.db = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    accounts: [
        { email: 'admin@example.com', password: 'Password123!', role: 'admin', verified: true, firstName: 'Admin', lastName: 'User' }
    ],
    employees: [],
    departments: [{ name: 'Engineering' }, { name: 'HR' }]
};

// Persistence [cite: 1, 498]
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

// SPA Routing Engine [cite: 1, 331]
function handleRouting() {
    const hash = window.location.hash || '#/';
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    const activePageId = hash === '#/' ? 'home-page' : hash.replace('#/', '') + '-page';
    const activePage = document.getElementById(activePageId);
    
    if (activePage) {
        activePage.classList.add('active');
    }

    // Protection [cite: 442]
    if (['#/profile', '#/employees'].includes(hash) && !currentUser) {
        window.location.hash = '#/login';
    }
}

// Auth State Management [cite: 1, 339]
function setAuthState(isAuth, user = null) {
    currentUser = user;
    const body = document.body;
    if (isAuth) {
        body.classList.replace('not-authenticated', 'authenticated');
        if (user.role === 'admin') body.classList.add('is-admin');
        renderProfile();
    } else {
        body.classList.replace('authenticated', 'not-authenticated');
        body.classList.remove('is-admin');
    }
}

// Registration Logic [cite: 1, 333]
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (window.db.accounts.find(a => a.email === email)) return alert("Email exists!");

    window.db.accounts.push({
        email, password, role: 'user', verified: false,
        firstName: document.getElementById('reg-firstname').value,
        lastName: document.getElementById('reg-lastname').value
    });
    
    localStorage.setItem('unverified_email', email);
    saveToStorage();
    window.location.hash = '#/verify-email';
});

// Simulation of Verification [cite: 1, 335]
function simulateVerification() {
    const email = localStorage.getItem('unverified_email');
    const user = window.db.accounts.find(a => a.email === email);
    if (user) user.verified = true;
    saveToStorage();
    alert("Email verified! You can now login.");
    window.location.hash = '#/login';
}

// Login Logic [cite: 1, 474]
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    const user = window.db.accounts.find(a => a.email === email && a.password === pass && a.verified);
    if (user) {
        setAuthState(true, user);
        window.location.hash = '#/profile';
    } else {
        alert("Invalid credentials or unverified account!");
    }
});

function logout() {
    setAuthState(false);
    window.location.hash = '#/';
}

function renderProfile() {
    if (!currentUser) return;
    document.getElementById('profile-details').innerHTML = `
        <p><strong>Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Role:</strong> ${currentUser.role}</p>
    `;
}

// Initialize
window.addEventListener('hashchange', handleRouting);
window.onload = handleRouting;