let currentUser = null;

function setAuthState(isAuth, user = null) {
    currentUser = user;
    document.body.classList.toggle("authenticated", isAuth);
    document.body.classList.toggle("not-authenticated", !isAuth);

    // Update navbar username
    const usernameSpan = document.getElementById("nav-username");
    if (user) usernameSpan.textContent = user.firstName || "User";

    // Add admin class if user is admin
    if (user?.role === "admin") {
        document.body.classList.add("is-admin");
    } else {
        document.body.classList.remove("is-admin");
    }

    // Show/hide navbar links
    document.querySelectorAll(".role-logged-in").forEach(el => el.style.display = isAuth ? "block" : "none");
    document.querySelectorAll(".role-logged-out").forEach(el => el.style.display = isAuth ? "none" : "block");
    document.querySelectorAll(".role-admin").forEach(el => el.style.display = (isAuth && user?.role === "admin") ? "block" : "none");
}

// Auto-login if auth_token exists
const token = localStorage.getItem("auth_token");
if (token) {
    const user = window.db.accounts.find(acc => acc.email === token);
    if (user) setAuthState(true, user);
}


// In-memory "database"
window.db = window.db || { accounts: [] };

// Load accounts from localStorage if exists
const savedAccounts = localStorage.getItem("accounts");
if (savedAccounts) {
    window.db.accounts = JSON.parse(savedAccounts);
}


/* ROUTING */
function navigateTo(hash) {
    window.location.hash = hash;
}

function handleRouting() {
    let hash = window.location.hash;

    // If no hash, go to home
    if (!hash) {
        navigateTo("#/");
        return;
    }

    // Hide all pages
    const pages = document.querySelectorAll(".page");
    pages.forEach(page => page.classList.remove("active"));

    // ROUTING LOGIC
    switch (hash) {
        case "#/login":
            document.getElementById("login-page").classList.add("active");
            break;

        case "#/register":
            document.getElementById("register-page").classList.add("active");
            break;

        case "#/verify-email":
            document.getElementById("verify-email-page").classList.add("active");
            break;

        case "#/profile":
            // BLOCK if not logged in
            if (!currentUser) {
                navigateTo("#/login");
                return;
            }
            document.getElementById("profile-page").classList.add("active");
            break;

        case "#/employees":
        case "#/accounts":
        case "#/departments":
            // BLOCK if not admin
            if (!currentUser || currentUser.role !== "admin") {
                navigateTo("#/");
                return;
            }
            document.getElementById(hash.replace("#/", "") + "-page")
                .classList.add("active");
            break;

        case "#/requests":
            if (!currentUser) {
                navigateTo("#/login");
                return;
            }
            document.getElementById("requests-page").classList.add("active");
            break;

        default:
            document.getElementById("home-page").classList.add("active");
    }
}


window.addEventListener("hashchange", handleRouting);
handleRouting();

// Initialize in-memory database
window.db = window.db || { accounts: [] };

// Registration form
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const firstName = registerForm.firstName.value.trim();
    const lastName = registerForm.lastName.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;

    // Check if email already exists
    const exists = window.db.accounts.find(acc => acc.email === email);
    if (exists) {
      alert("Email already registered");
      return;
    }

    // Save new account
    const newUser = { firstName, lastName, email, password, verified: false, role: "user" };
    window.db.accounts.push(newUser);
    localStorage.setItem("accounts", JSON.stringify(window.db.accounts));
    localStorage.setItem("unverified_email", email);

    alert("Registered successfully! Now verify your email.");
    window.location.hash = "#/verify-email";
  });
}


