const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static('public'));

// Database simulation with JSON file
const dbFile = path.join(__dirname, 'data.json');

function getDatabase() {
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ users: [], orders: [] }));
  }
  return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
}

function saveDatabase(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// Helper function to send WhatsApp message
async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    // If Twilio credentials are not set, log the message instead
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.log('WhatsApp Message (Demo Mode):', message);
      console.log('Phone:', phoneNumber);
      return { success: true, demo: true };
    }

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        From: process.env.TWILIO_WHATSAPP_NUMBER,
        To: `whatsapp:${phoneNumber}`,
        Body: message
      }),
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN
        }
      }
    );

    return { success: true, sid: response.data.sid };
  } catch (error) {
    console.error('WhatsApp Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Routes

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const db = getDatabase();
  
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password, // In production, use bcrypt
    phone,
    createdAt: new Date()
  };

  db.users.push(newUser);
  saveDatabase(db);

  res.json({ 
    success: true, 
    message: 'Registration successful',
    user: { id: newUser.id, name, email, phone }
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const db = getDatabase();
  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({ 
    success: true, 
    message: 'Login successful',
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
  });
});

// Create order endpoint
app.post('/api/orders/create', (req, res) => {
  const { userId, quantity, contactNumber, location } = req.body;
  const locationFile = req.files?.locationImage;

  if (!userId || !quantity || !contactNumber) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const db = getDatabase();
  const user = db.users.find(u => u.id === parseInt(userId));

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Save uploaded location image
  let locationImagePath = null;
  if (locationFile) {
    const uploadPath = path.join(__dirname, 'uploads', `${Date.now()}_${locationFile.name}`);
    locationFile.mv(uploadPath);
    locationImagePath = `/uploads/${path.basename(uploadPath)}`;
  }

  const newOrder = {
    id: Date.now(),
    userId,
    userName: user.name,
    userEmail: user.email,
    quantity: parseInt(quantity),
    contactNumber,
    location: location || 'Not specified',
    locationImage: locationImagePath,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  db.orders.push(newOrder);
  saveDatabase(db);

  // Send WhatsApp message to admin
  const adminMessage = `
📦 NEW WATER CAN ORDER

👤 Customer: ${user.name}
📧 Email: ${user.email}
📱 Contact: ${contactNumber}
🏠 Location: ${location || 'Not specified'}
🚚 Quantity: ${quantity} cans
📍 Location Image: ${locationImagePath ? 'Uploaded' : 'Not uploaded'}
🕐 Order Time: ${new Date().toLocaleString()}

Order ID: ${newOrder.id}
Status: Pending
  `;

  // Send to admin WhatsApp
  if (process.env.ADMIN_WHATSAPP_NUMBER) {
    sendWhatsAppMessage(process.env.ADMIN_WHATSAPP_NUMBER.replace('whatsapp:', ''), adminMessage);
  } else {
    console.log('Demo WhatsApp Message:', adminMessage);
  }

  res.json({ 
    success: true, 
    message: 'Order created successfully',
    order: newOrder
  });
});

// Get orders endpoint
app.get('/api/orders/:userId', (req, res) => {
  const { userId } = req.params;
  const db = getDatabase();
  
  const orders = db.orders.filter(o => o.userId === parseInt(userId));
  res.json({ success: true, orders });
});

// Get all orders (admin)
app.get('/api/admin/orders', (req, res) => {
  const db = getDatabase();
  res.json({ success: true, orders: db.orders });
});

// Update order status (admin)
app.put('/api/admin/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const db = getDatabase();
  const order = db.orders.find(o => o.id === parseInt(orderId));

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  order.updatedAt = new Date();
  saveDatabase(db);

  // Send WhatsApp notification to customer
  const customerMessage = `Your water can order (ID: ${orderId}) status has been updated to: ${status}`;
  sendWhatsAppMessage(order.contactNumber, customerMessage);

  res.json({ success: true, message: 'Order updated', order });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Water Can Delivery Server running on http://localhost:${PORT}`);
  console.log('📱 Ensure .env file is configured for WhatsApp integration');
});
