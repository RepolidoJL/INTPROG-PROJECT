// ============================================================
//  FULL-STACK SPA - script.js
//  Simple, readable JavaScript for easy explanation
// ============================================================

// --- 1. GLOBAL VARIABLES ---
let currentUser = null;
const STORAGE_KEY = 'ipt_demo_v1';

// window.db is our "fake database" stored in memory and localStorage
window.db = {
  accounts: [],
  departments: [],
  employees: [],
  requests: []
};


// ============================================================
// 2. LOCALSTORAGE FUNCTIONS
// ============================================================

function loadFromStorage() {
  // Try to get saved data from localStorage
  var saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    // If data exists, parse it from JSON text back to an object
    try {
      window.db = JSON.parse(saved);
    } catch (e) {
      // If data is broken/corrupt, seed fresh data
      seedDefaultData();
    }
  } else {
    // No data found, create default data
    seedDefaultData();
  }
}

function saveToStorage() {
  // Convert our db object to JSON text and save it
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

function seedDefaultData() {
  // This runs the very first time - creates starter data
  window.db = {
    accounts: [
      {
        id: 'acc_1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'admin',
        verified: true
      }
    ],
    departments: [
      { id: 'dept_1', name: 'Engineering', description: 'Software team' },
      { id: 'dept_2', name: 'HR', description: 'Human Resources' }
    ],
    employees: [],
    requests: []
  };
  saveToStorage();
}


// ============================================================
// 3. ROUTING (NAVIGATION)
// ============================================================

function navigateTo(hash) {
  // Change the URL hash - this triggers the hashchange event
  window.location.hash = hash;
}

function handleRouting() {
  // Read the current hash from the URL (e.g. "#/login")
  var hash = window.location.hash;

  // Default to home if empty
  if (!hash || hash === '#') {
    hash = '#/';
  }

  // --- PROTECTED ROUTES: redirect if not logged in ---
  var protectedRoutes = ['#/profile', '#/requests'];
  var adminRoutes = ['#/employees', '#/accounts', '#/departments'];

  if (protectedRoutes.indexOf(hash) !== -1 && !currentUser) {
    navigateTo('#/login');
    return;
  }

  if (adminRoutes.indexOf(hash) !== -1) {
    if (!currentUser) {
      navigateTo('#/login');
      return;
    }
    if (currentUser.role !== 'admin') {
      showToast('Access denied. Admins only.', 'danger');
      navigateTo('#/');
      return;
    }
  }

  // --- HIDE ALL PAGES ---
  var allPages = document.querySelectorAll('.page');
  allPages.forEach(function(page) {
    page.classList.remove('active');
  });

  // --- SHOW THE MATCHING PAGE ---
  if (hash === '#/') {
    document.getElementById('home-page').classList.add('active');

  } else if (hash === '#/register') {
    document.getElementById('register-page').classList.add('active');

  } else if (hash === '#/verify-email') {
    document.getElementById('verify-email-page').classList.add('active');
    renderVerifyPage();

  } else if (hash === '#/login') {
    document.getElementById('login-page').classList.add('active');

  } else if (hash === '#/profile') {
    document.getElementById('profile-page').classList.add('active');
    renderProfile();

  } else if (hash === '#/employees') {
    document.getElementById('employees-page').classList.add('active');
    renderEmployeesTable();

  } else if (hash === '#/departments') {
    document.getElementById('departments-page').classList.add('active');
    renderDepartmentsTable();

  } else if (hash === '#/accounts') {
    document.getElementById('accounts-page').classList.add('active');
    renderAccountsList();

  } else if (hash === '#/requests') {
    document.getElementById('requests-page').classList.add('active');
    renderRequestsTable();

  } else {
    // Unknown route, go home
    document.getElementById('home-page').classList.add('active');
  }
}

// Listen for URL hash changes
window.addEventListener('hashchange', handleRouting);


// ============================================================
// 4. AUTH STATE MANAGEMENT
// ============================================================

function setAuthState(isLoggedIn, user) {
  // Update the global currentUser variable
  currentUser = user || null;

  // Remove all auth classes first
  document.body.classList.remove('authenticated', 'not-authenticated', 'is-admin');

  if (isLoggedIn && user) {
    // Add authenticated class to show logged-in elements
    document.body.classList.add('authenticated');

    // If admin, add is-admin class to show admin elements
    if (user.role === 'admin') {
      document.body.classList.add('is-admin');
    }

    // Update the dropdown button to show the username
    var btn = document.getElementById('userDropdownBtn');
    btn.textContent = user.firstName + ' ▾';

  } else {
    // Not logged in
    document.body.classList.add('not-authenticated');
  }
}


// ============================================================
// 5. REGISTRATION
// ============================================================

document.getElementById('registerBtn').addEventListener('click', function() {
  var firstName = document.getElementById('reg-firstname').value.trim();
  var lastName  = document.getElementById('reg-lastname').value.trim();
  var email     = document.getElementById('reg-email').value.trim();
  var password  = document.getElementById('reg-password').value;
  var errorDiv  = document.getElementById('register-error');

  // --- Validation ---
  if (!firstName || !lastName || !email || !password) {
    errorDiv.textContent = 'Please fill in all fields.';
    errorDiv.classList.remove('d-none');
    return;
  }
  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters.';
    errorDiv.classList.remove('d-none');
    return;
  }

  // Check if email already exists
  var existing = window.db.accounts.find(function(acc) {
    return acc.email === email;
  });

  if (existing) {
    errorDiv.textContent = 'An account with that email already exists.';
    errorDiv.classList.remove('d-none');
    return;
  }

  // --- Create new account ---
  var newAccount = {
    id: 'acc_' + Date.now(),
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    role: 'user',
    verified: false
  };

  window.db.accounts.push(newAccount);
  saveToStorage();

  // Store the email so we can find the account in verification step
  localStorage.setItem('unverified_email', email);

  // Clear the form
  errorDiv.classList.add('d-none');
  document.getElementById('reg-firstname').value = '';
  document.getElementById('reg-lastname').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-password').value = '';

  // Go to verify page
  navigateTo('#/verify-email');
});


// ============================================================
// 6. EMAIL VERIFICATION (Simulated)
// ============================================================

function renderVerifyPage() {
  var email = localStorage.getItem('unverified_email') || 'your email';
  document.getElementById('verify-message').textContent = '✅ A verification link has been sent to ' + email;
}

document.getElementById('simulateVerifyBtn').addEventListener('click', function() {
  var email = localStorage.getItem('unverified_email');

  if (!email) {
    showToast('No email to verify.', 'danger');
    return;
  }

  // Find the account and mark it as verified
  var account = window.db.accounts.find(function(acc) {
    return acc.email === email;
  });

  if (account) {
    account.verified = true;
    saveToStorage();
    localStorage.removeItem('unverified_email');
    showToast('Email verified! You may now log in.', 'success');
    navigateTo('#/login');

    // Show success message on login page
    document.getElementById('login-success').textContent = '✅ Email verified! You may now log in.';
    document.getElementById('login-success').classList.remove('d-none');
  } else {
    showToast('Account not found.', 'danger');
  }
});


// ============================================================
// 7. LOGIN
// ============================================================

document.getElementById('loginBtn').addEventListener('click', function() {
  var email    = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var errorDiv = document.getElementById('login-error');

  if (!email || !password) {
    errorDiv.textContent = 'Please enter email and password.';
    errorDiv.classList.remove('d-none');
    return;
  }

  // Look for a matching account that is verified
  var account = window.db.accounts.find(function(acc) {
    return acc.email === email && acc.password === password && acc.verified === true;
  });

  if (account) {
    // Save token (we use email as a simple token)
    localStorage.setItem('auth_token', account.email);

    // Update the auth state
    setAuthState(true, account);

    // Clear form
    errorDiv.classList.add('d-none');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';

    showToast('Welcome back, ' + account.firstName + '!', 'success');
    navigateTo('#/profile');

  } else {
    errorDiv.textContent = 'Invalid email, password, or account not verified.';
    errorDiv.classList.remove('d-none');
  }
});


// ============================================================
// 8. LOGOUT
// ============================================================

document.getElementById('logoutBtn').addEventListener('click', function(event) {
  event.preventDefault();
  localStorage.removeItem('auth_token');
  setAuthState(false, null);
  showToast('You have been logged out.', 'info');
  navigateTo('#/');
});


// ============================================================
// 9. PROFILE PAGE
// ============================================================

function renderProfile() {
  if (!currentUser) return;

  var container = document.getElementById('profile-info');
  container.innerHTML =
    '<h5>' + currentUser.firstName + ' ' + currentUser.lastName + '</h5>' +
    '<p><strong>Email:</strong> ' + currentUser.email + '</p>' +
    '<p><strong>Role:</strong> ' + currentUser.role + '</p>' +
    '<button class="btn btn-outline-primary" onclick="alert(\'Edit profile coming soon!\')">Edit Profile</button>';
}


// ============================================================
// 10. ADMIN - ACCOUNTS CRUD
// ============================================================

function renderAccountsList() {
  var tbody = document.getElementById('accounts-table-body');
  tbody.innerHTML = '';

  window.db.accounts.forEach(function(acc) {
    var verifiedIcon = acc.verified ? '✅' : '—';
    var row = document.createElement('tr');
    row.innerHTML =
      '<td>' + acc.firstName + ' ' + acc.lastName + '</td>' +
      '<td>' + acc.email + '</td>' +
      '<td>' + acc.role + '</td>' +
      '<td>' + verifiedIcon + '</td>' +
      '<td>' +
        '<button class="btn btn-sm btn-primary me-1" onclick="editAccount(\'' + acc.id + '\')">Edit</button>' +
        '<button class="btn btn-sm btn-warning me-1" onclick="resetPassword(\'' + acc.id + '\')">Reset PW</button>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteAccount(\'' + acc.id + '\')">Delete</button>' +
      '</td>';
    tbody.appendChild(row);
  });
}

document.getElementById('showAddAccountFormBtn').addEventListener('click', function() {
  // Clear the form for adding a new account
  document.getElementById('account-form-title').textContent = 'Add Account';
  document.getElementById('acc-edit-id').value = '';
  document.getElementById('acc-firstname').value = '';
  document.getElementById('acc-lastname').value = '';
  document.getElementById('acc-email').value = '';
  document.getElementById('acc-password').value = '';
  document.getElementById('acc-role').value = 'user';
  document.getElementById('acc-verified').checked = false;
  document.getElementById('acc-password-field').style.display = 'block';
  document.getElementById('account-form-section').classList.remove('d-none');
});

document.getElementById('cancelAccountBtn').addEventListener('click', function() {
  document.getElementById('account-form-section').classList.add('d-none');
});

document.getElementById('saveAccountBtn').addEventListener('click', function() {
  var editId    = document.getElementById('acc-edit-id').value;
  var firstName = document.getElementById('acc-firstname').value.trim();
  var lastName  = document.getElementById('acc-lastname').value.trim();
  var email     = document.getElementById('acc-email').value.trim();
  var password  = document.getElementById('acc-password').value;
  var role      = document.getElementById('acc-role').value;
  var verified  = document.getElementById('acc-verified').checked;

  if (!firstName || !lastName || !email) {
    showToast('Please fill in all required fields.', 'danger');
    return;
  }

  if (editId) {
    // EDIT existing account
    var account = window.db.accounts.find(function(a) { return a.id === editId; });
    if (account) {
      account.firstName = firstName;
      account.lastName  = lastName;
      account.email     = email;
      account.role      = role;
      account.verified  = verified;
      if (password) account.password = password;
    }
    showToast('Account updated!', 'success');
  } else {
    // ADD new account
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'danger');
      return;
    }
    var newAcc = {
      id: 'acc_' + Date.now(),
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      role: role,
      verified: verified
    };
    window.db.accounts.push(newAcc);
    showToast('Account created!', 'success');
  }

  saveToStorage();
  document.getElementById('account-form-section').classList.add('d-none');
  renderAccountsList();
});

function editAccount(id) {
  var account = window.db.accounts.find(function(a) { return a.id === id; });
  if (!account) return;

  document.getElementById('account-form-title').textContent = 'Edit Account';
  document.getElementById('acc-edit-id').value = id;
  document.getElementById('acc-firstname').value = account.firstName;
  document.getElementById('acc-lastname').value = account.lastName;
  document.getElementById('acc-email').value = account.email;
  document.getElementById('acc-password').value = '';
  document.getElementById('acc-role').value = account.role;
  document.getElementById('acc-verified').checked = account.verified;
  document.getElementById('acc-password-field').style.display = 'block';
  document.getElementById('account-form-section').classList.remove('d-none');
}

function resetPassword(id) {
  var newPw = prompt('Enter new password (min 6 characters):');
  if (!newPw) return;
  if (newPw.length < 6) {
    showToast('Password too short!', 'danger');
    return;
  }
  var account = window.db.accounts.find(function(a) { return a.id === id; });
  if (account) {
    account.password = newPw;
    saveToStorage();
    showToast('Password reset successfully!', 'success');
  }
}

function deleteAccount(id) {
  // Prevent admin from deleting their own account
  if (currentUser && currentUser.id === id) {
    showToast('You cannot delete your own account!', 'danger');
    return;
  }

  var confirmed = confirm('Are you sure you want to delete this account?');
  if (!confirmed) return;

  // Filter out the account with that id
  window.db.accounts = window.db.accounts.filter(function(a) {
    return a.id !== id;
  });

  saveToStorage();
  showToast('Account deleted.', 'info');
  renderAccountsList();
}


// ============================================================
// 11. ADMIN - DEPARTMENTS CRUD
// ============================================================

function renderDepartmentsTable() {
  var tbody = document.getElementById('departments-table-body');
  tbody.innerHTML = '';

  window.db.departments.forEach(function(dept) {
    var row = document.createElement('tr');
    row.innerHTML =
      '<td>' + dept.name + '</td>' +
      '<td>' + dept.description + '</td>' +
      '<td>' +
        '<button class="btn btn-sm btn-primary me-1" onclick="editDepartment(\'' + dept.id + '\')">Edit</button>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteDepartment(\'' + dept.id + '\')">Delete</button>' +
      '</td>';
    tbody.appendChild(row);
  });
}

document.getElementById('showAddDeptFormBtn').addEventListener('click', function() {
  document.getElementById('dept-form-title').textContent = 'Add Department';
  document.getElementById('dept-edit-id').value = '';
  document.getElementById('dept-name').value = '';
  document.getElementById('dept-description').value = '';
  document.getElementById('dept-form-section').classList.remove('d-none');
});

document.getElementById('cancelDeptBtn').addEventListener('click', function() {
  document.getElementById('dept-form-section').classList.add('d-none');
});

document.getElementById('saveDeptBtn').addEventListener('click', function() {
  var editId      = document.getElementById('dept-edit-id').value;
  var name        = document.getElementById('dept-name').value.trim();
  var description = document.getElementById('dept-description').value.trim();

  if (!name) {
    showToast('Please enter a department name.', 'danger');
    return;
  }

  if (editId) {
    var dept = window.db.departments.find(function(d) { return d.id === editId; });
    if (dept) {
      dept.name = name;
      dept.description = description;
    }
    showToast('Department updated!', 'success');
  } else {
    window.db.departments.push({
      id: 'dept_' + Date.now(),
      name: name,
      description: description
    });
    showToast('Department added!', 'success');
  }

  saveToStorage();
  document.getElementById('dept-form-section').classList.add('d-none');
  renderDepartmentsTable();
});

function editDepartment(id) {
  var dept = window.db.departments.find(function(d) { return d.id === id; });
  if (!dept) return;

  document.getElementById('dept-form-title').textContent = 'Edit Department';
  document.getElementById('dept-edit-id').value = id;
  document.getElementById('dept-name').value = dept.name;
  document.getElementById('dept-description').value = dept.description;
  document.getElementById('dept-form-section').classList.remove('d-none');
}

function deleteDepartment(id) {
  var confirmed = confirm('Delete this department?');
  if (!confirmed) return;

  window.db.departments = window.db.departments.filter(function(d) {
    return d.id !== id;
  });

  saveToStorage();
  showToast('Department deleted.', 'info');
  renderDepartmentsTable();
}


// ============================================================
// 12. ADMIN - EMPLOYEES CRUD
// ============================================================

function renderEmployeesTable() {
  var tbody = document.getElementById('employees-table-body');
  tbody.innerHTML = '';

  if (window.db.employees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No employees.</td></tr>';
    return;
  }

  window.db.employees.forEach(function(emp) {
    // Find the department name using the dept id
    var dept = window.db.departments.find(function(d) { return d.id === emp.deptId; });
    var deptName = dept ? dept.name : 'Unknown';

    var row = document.createElement('tr');
    row.innerHTML =
      '<td>' + emp.employeeId + '</td>' +
      '<td>' + emp.userEmail + '</td>' +
      '<td>' + emp.position + '</td>' +
      '<td>' + deptName + '</td>' +
      '<td>' +
        '<button class="btn btn-sm btn-primary me-1" onclick="editEmployee(\'' + emp.id + '\')">Edit</button>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteEmployee(\'' + emp.id + '\')">Delete</button>' +
      '</td>';
    tbody.appendChild(row);
  });
}

function populateDeptDropdown() {
  var select = document.getElementById('emp-dept');
  select.innerHTML = '';
  window.db.departments.forEach(function(dept) {
    var option = document.createElement('option');
    option.value = dept.id;
    option.textContent = dept.name;
    select.appendChild(option);
  });
}

document.getElementById('showAddEmployeeFormBtn').addEventListener('click', function() {
  document.getElementById('employee-form-title').textContent = 'Add/Edit Employee';
  document.getElementById('emp-edit-id').value = '';
  document.getElementById('emp-id').value = '';
  document.getElementById('emp-email').value = '';
  document.getElementById('emp-position').value = '';
  document.getElementById('emp-hiredate').value = '';
  populateDeptDropdown();
  document.getElementById('employee-form-section').classList.remove('d-none');
});

document.getElementById('cancelEmployeeBtn').addEventListener('click', function() {
  document.getElementById('employee-form-section').classList.add('d-none');
});

document.getElementById('saveEmployeeBtn').addEventListener('click', function() {
  var editId     = document.getElementById('emp-edit-id').value;
  var employeeId = document.getElementById('emp-id').value.trim();
  var userEmail  = document.getElementById('emp-email').value.trim();
  var position   = document.getElementById('emp-position').value.trim();
  var deptId     = document.getElementById('emp-dept').value;
  var hireDate   = document.getElementById('emp-hiredate').value;

  if (!employeeId || !userEmail || !position) {
    showToast('Please fill in all required fields.', 'danger');
    return;
  }

  // Check if the email matches an existing account
  var matchingAccount = window.db.accounts.find(function(a) { return a.email === userEmail; });
  if (!matchingAccount) {
    showToast('No account found with that email.', 'danger');
    return;
  }

  if (editId) {
    var emp = window.db.employees.find(function(e) { return e.id === editId; });
    if (emp) {
      emp.employeeId = employeeId;
      emp.userEmail  = userEmail;
      emp.userId     = matchingAccount.id;
      emp.position   = position;
      emp.deptId     = deptId;
      emp.hireDate   = hireDate;
    }
    showToast('Employee updated!', 'success');
  } else {
    window.db.employees.push({
      id: 'emp_' + Date.now(),
      employeeId: employeeId,
      userEmail: userEmail,
      userId: matchingAccount.id,
      position: position,
      deptId: deptId,
      hireDate: hireDate
    });
    showToast('Employee added!', 'success');
  }

  saveToStorage();
  document.getElementById('employee-form-section').classList.add('d-none');
  renderEmployeesTable();
});

function editEmployee(id) {
  var emp = window.db.employees.find(function(e) { return e.id === id; });
  if (!emp) return;

  populateDeptDropdown();
  document.getElementById('employee-form-title').textContent = 'Edit Employee';
  document.getElementById('emp-edit-id').value = id;
  document.getElementById('emp-id').value = emp.employeeId;
  document.getElementById('emp-email').value = emp.userEmail;
  document.getElementById('emp-position').value = emp.position;
  document.getElementById('emp-dept').value = emp.deptId;
  document.getElementById('emp-hiredate').value = emp.hireDate;
  document.getElementById('employee-form-section').classList.remove('d-none');
}

function deleteEmployee(id) {
  var confirmed = confirm('Delete this employee record?');
  if (!confirmed) return;

  window.db.employees = window.db.employees.filter(function(e) {
    return e.id !== id;
  });

  saveToStorage();
  showToast('Employee deleted.', 'info');
  renderEmployeesTable();
}


// ============================================================
// 13. REQUESTS
// ============================================================

var requestModal = null;

function renderRequestsTable() {
  if (!currentUser) return;

  // Filter requests that belong to the current user
  var myRequests = window.db.requests.filter(function(req) {
    return req.employeeEmail === currentUser.email;
  });

  var tbody = document.getElementById('requests-table-body');
  var emptyDiv = document.getElementById('requests-empty');
  var table = document.getElementById('requests-table');

  tbody.innerHTML = '';

  if (myRequests.length === 0) {
    emptyDiv.classList.remove('d-none');
    table.classList.add('d-none');
    return;
  }

  emptyDiv.classList.add('d-none');
  table.classList.remove('d-none');

  myRequests.forEach(function(req) {
    // Determine badge color based on status
    var badgeClass = 'bg-warning text-dark';
    if (req.status === 'Approved') badgeClass = 'bg-success';
    if (req.status === 'Rejected') badgeClass = 'bg-danger';

    // Build a summary of items
    var itemSummary = req.items.map(function(item) {
      return item.name + ' (x' + item.qty + ')';
    }).join(', ');

    var row = document.createElement('tr');
    row.innerHTML =
      '<td>' + req.date + '</td>' +
      '<td>' + req.type + '</td>' +
      '<td>' + itemSummary + '</td>' +
      '<td><span class="badge ' + badgeClass + '">' + req.status + '</span></td>';
    tbody.appendChild(row);
  });
}

// Open the request modal
function openRequestModal() {
  // Start with one blank item row
  document.getElementById('request-items-container').innerHTML = '';
  addItemRow();
  requestModal.show();
}

document.getElementById('openRequestModalBtn').addEventListener('click', openRequestModal);
document.getElementById('openRequestModalBtn2').addEventListener('click', openRequestModal);

// Add an item row to the request form
document.getElementById('addItemBtn').addEventListener('click', addItemRow);

function addItemRow() {
  var container = document.getElementById('request-items-container');

  var row = document.createElement('div');
  row.className = 'd-flex gap-2 mb-2 align-items-center item-row';
  row.innerHTML =
    '<input type="text" class="form-control item-name" placeholder="Item name" />' +
    '<input type="number" class="form-control item-qty" value="1" min="1" style="width:80px" />' +
    '<button class="btn btn-sm btn-danger remove-item-btn">×</button>';

  // The remove button removes this specific row
  row.querySelector('.remove-item-btn').addEventListener('click', function() {
    container.removeChild(row);
  });

  container.appendChild(row);
}

document.getElementById('submitRequestBtn').addEventListener('click', function() {
  var type = document.getElementById('request-type').value;
  var itemRows = document.querySelectorAll('.item-row');
  var items = [];

  // Collect all item rows
  itemRows.forEach(function(row) {
    var name = row.querySelector('.item-name').value.trim();
    var qty  = row.querySelector('.item-qty').value;
    if (name) {
      items.push({ name: name, qty: qty });
    }
  });

  // Validate at least one item
  if (items.length === 0) {
    showToast('Please add at least one item.', 'danger');
    return;
  }

  // Save the request
  var newRequest = {
    id: 'req_' + Date.now(),
    type: type,
    items: items,
    status: 'Pending',
    date: new Date().toLocaleDateString(),
    employeeEmail: currentUser.email
  };

  window.db.requests.push(newRequest);
  saveToStorage();

  requestModal.hide();
  showToast('Request submitted!', 'success');
  renderRequestsTable();
});


// ============================================================
// 14. TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type) {
  // type can be: 'success', 'danger', 'info', 'warning'
  var container = document.getElementById('toastContainer');

  var toast = document.createElement('div');
  toast.className = 'alert alert-' + type + ' shadow';
  toast.style.minWidth = '250px';
  toast.textContent = message;

  container.appendChild(toast);

  // Automatically remove the toast after 3 seconds
  setTimeout(function() {
    container.removeChild(toast);
  }, 3000);
}


// ============================================================
// 15. APP INITIALIZATION (runs when page first loads)
// ============================================================

function initApp() {
  // Load data from localStorage
  loadFromStorage();

  // Check if there is a saved login session
  var savedToken = localStorage.getItem('auth_token');
  if (savedToken) {
    // Find the account matching the saved token (email)
    var account = window.db.accounts.find(function(a) {
      return a.email === savedToken;
    });

    if (account) {
      // Restore the login session
      setAuthState(true, account);
    } else {
      // Token is invalid, clear it
      localStorage.removeItem('auth_token');
    }
  }

  // Initialize the Bootstrap modal object
  requestModal = new bootstrap.Modal(document.getElementById('requestModal'));

  // Set initial hash if empty
  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = '#/';
  }

  // Run routing to show the correct page
  handleRouting();
}

// Start the app
initApp();