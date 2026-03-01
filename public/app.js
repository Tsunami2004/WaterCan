// Global state
let currentUser = null;

// API base URL
const API_URL = 'http://localhost:3000/api';

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

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
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
            showPopup('❌ ' + data.message);
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
            showPopup('❌ ' + data.message);
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
            showPopup('❌ ' + data.message);
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
                    ${order.locationImage ? `<p><strong>Photo:</strong> <a href="${order.locationImage}" target="_blank">View</a></p>` : ''}
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
