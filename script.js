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

    // Protection: must be logged in
    if (
        ['#/profile', '#/employees', '#/departments'].includes(hash) 
        && !currentUser
    ) {
        window.location.hash = '#/login';
        return;
    }

    // Admin-only protection
    if (
        ['#/employees', '#/departments'].includes(hash) 
        && currentUser?.role !== 'admin'
    ) {
        window.location.hash = '#/';
        return;
    }

    const activePageId = hash === '#/' 
        ? 'home-page' 
        : hash.replace('#/', '') + '-page';

    const activePage = document.getElementById(activePageId);

    if (activePage) {
        activePage.classList.add('active');
    }

    // Render admin pages if needed
    if (hash === '#/employees') renderEmployees();
    if (hash === '#/departments') renderDepartments();
}

// Auth State Management [cite: 1, 339]
function setAuthState(isAuth, user = null) {
    currentUser = user;
    const body = document.body;
    const navUsername = document.getElementById('nav-username');

    if (isAuth) {
        body.classList.replace('not-authenticated', 'authenticated');
        
        // Updates the dropdown label with the user's name (e.g., "Admin" or "John")
        if (navUsername && user) {
            navUsername.innerText = user.firstName;
        }

        if (user.role === 'admin') {
            body.classList.add('is-admin');
        } else {
            body.classList.remove('is-admin');
        }
        renderProfile();
    } else {
        body.classList.replace('authenticated', 'not-authenticated');
        body.classList.remove('is-admin');
        if (navUsername) navUsername.innerText = "User";
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
    localStorage.setItem('auth_token', user.email);
    setAuthState(true, user);
    window.location.hash = '#/profile';
    } else {
        alert("Invalid credentials or unverified account!");
    }
});

function logout() {
    localStorage.removeItem('auth_token');
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

function checkAuthOnLoad() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const user = window.db.accounts.find(a => a.email === token);
    if (user) {
        setAuthState(true, user);
    }
}



// Initialize
window.addEventListener('hashchange', handleRouting);
window.onload = () => {
    checkAuthOnLoad();
    handleRouting();
};
