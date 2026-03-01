// Global state
let currentUser = null;

// API base URL - Backend API on port 8001
const API_URL = 'http://localhost:8001/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showPage('dashboard');
        loadOrders();
        updateUIForLoggedIn();
    } else {
        showPage('home');
    }
});

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const currentType = field.getAttribute('type');
    field.setAttribute('type', currentType === 'password' ? 'text' : 'password');
}

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Load admin orders if viewing admin panel
    if (pageId === 'admin') {
        loadAdminOrders();
    }
    
    // Update navbar active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    if (pageId !== 'home') {
        const activeLink = document.querySelector(`.nav-link[onclick*="${pageId}"]`);
        if (activeLink) activeLink.classList.add('active');
    }
}

// Update UI based on login state
function updateUIForLoggedIn() {
    if (currentUser) {
        document.getElementById('logoutLink').style.display = 'inline-block';
        document.getElementById('userName').textContent = currentUser.name;
    } else {
        document.getElementById('logoutLink').style.display = 'none';
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showPopup('✅ Registration successful! Please login.');
            document.querySelector('#register form').reset();
            setTimeout(() => showPage('login'), 1500);
        } else {
            showPopup('❌ ' + data.detail);
        }
    } catch (error) {
        showPopup('❌ Registration failed: ' + error.message);
    }
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateUIForLoggedIn();
            showPopup('✅ Login successful!');
            document.querySelector('#login form').reset();
            setTimeout(() => {
                showPage('dashboard');
                loadOrders();
            }, 1000);
        } else {
            showPopup('❌ ' + data.detail);
        }
    } catch (error) {
        showPopup('❌ Login failed: ' + error.message);
    }
}

// Handle order placement
async function handleOrder(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showPopup('❌ Please login first');
        return;
    }
    
    const quantity = document.getElementById('orderQuantity').value;
    const contactNumber = document.getElementById('orderContact').value;
    const location = document.getElementById('orderLocation').value;
    const locationImage = document.getElementById('locationImage').files[0];
    
    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('quantity', quantity);
    formData.append('contactNumber', contactNumber);
    formData.append('location', location);
    if (locationImage) {
        formData.append('locationImage', locationImage);
    }
    
    try {
        const response = await fetch(`${API_URL}/orders/create`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showPopup('✅ Order placed successfully!\n📱 Admin will contact you on WhatsApp');
            document.querySelector('#order form').reset();
            setTimeout(() => {
                showPage('dashboard');
                loadOrders();
            }, 2000);
        } else {
            showPopup('❌ ' + data.detail);
        }
    } catch (error) {
        showPopup('❌ Order failed: ' + error.message);
    }
}

// Load user orders
async function loadOrders() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/orders/${currentUser.id}`);
        const data = await response.json();
        
        const ordersList = document.getElementById('ordersList');
        
        if (data.orders && data.orders.length > 0) {
            ordersList.innerHTML = data.orders.map(order => `
                <div class="order-card">
                    <h4>Order #${order.id}</h4>
                    <div class="order-info">
                        <div>
                            <p><strong>Quantity:</strong> ${order.quantity} cans</p>
                            <p><strong>Contact:</strong> ${order.contactNumber}</p>
                        </div>
                        <div>
                            <p><strong>Location:</strong> ${order.location}</p>
                            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    ${order.locationImage ? `<p><strong>Photo:</strong> <a href="http://localhost:8001${order.locationImage}" target="_blank">View</a></p>` : ''}
                    <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                </div>
            `).join('');
        } else {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <p>📦 No orders yet</p>
                    <button class="btn btn-primary" onclick="showPage('order')">Place Your First Order</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersList').innerHTML = '<p>Error loading orders</p>';
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    updateUIForLoggedIn();
    showPage('home');
    showPopup('👋 You have been logged out');
}

// Show popup message
function showPopup(message) {
    document.getElementById('popupMessage').textContent = message;
    document.getElementById('popup').classList.add('show');
}

// Close popup
function closePopup() {
    document.getElementById('popup').classList.remove('show');
}

// Close popup when clicking outside
window.onclick = function(event) {
    const popup = document.getElementById('popup');
    if (event.target === popup) {
        popup.classList.remove('show');
    }
}

// Load all orders for admin panel
async function loadAdminOrders() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`);
        const data = await response.json();
        
        const allOrdersList = document.getElementById('allOrdersList');
        
        if (data.orders && data.orders.length > 0) {
            let html = '<table class="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Email</th><th>Phone</th><th>Location</th><th>Quantity</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody>';
            
            data.orders.forEach(order => {
                html += `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${order.userName}</td>
                        <td>${order.userEmail}</td>
                        <td>${order.contactNumber}</td>
                        <td>${order.location}</td>
                        <td>${order.quantity} cans</td>
                        <td><span class="order-status status-${order.status}">${order.status.toUpperCase()}</span></td>
                        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                            <div class="order-status-update">
                                <select id="status-${order.id}" onchange="updateOrderStatus(${order.id}, this.value)" style="padding: 5px; border-radius: 3px;">
                                    <option value="${order.status}" selected>${order.status}</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in-transit">In Transit</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            allOrdersList.innerHTML = html;
        } else {
            allOrdersList.innerHTML = `
                <div class="empty-state">
                    <p>📦 No orders yet</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('allOrdersList').innerHTML = '<p style="color: red;">Error loading orders</p>';
    }
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/admin/orders/${orderId}?status=${newStatus}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showPopup(`✅ Order #${orderId} status updated to: ${newStatus}`);
            setTimeout(() => loadAdminOrders(), 1000);
        } else {
            showPopup('❌ ' + data.detail);
        }
    } catch (error) {
        showPopup('❌ Error updating order: ' + error.message);
    }
}
