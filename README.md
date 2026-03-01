# WaterCan - Water Delivery Service Website
## Separated Backend & Frontend Architecture

Your website is now organized with a **separate backend and frontend** for better scalability and management.

### 🚀 Quick Start

#### **Frontend (Port 3001)**
```bash
cd frontend
npm install
npm start
```
Access: `http://localhost:3001`

#### **Backend (Port 8001)**
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Access: `http://localhost:8001`

---

## 📁 Project Structure

```
WATERCAN/
├── frontend/                 # Frontend Website
│   ├── public/
│   │   ├── index.html       # Main HTML file
│   │   ├── styles.css       # Styling
│   │   └── app.js           # Frontend JavaScript (connects to backend on 8001)
│   ├── package.json
│   ├── server.js            # Express.js server (runs on 3001)
│   └── node_modules/
│
├── backend/                  # FastAPI Backend Server
│   ├── main.py              # FastAPI application (runs on 8001)
│   ├── requirements.txt      # Python dependencies
│   ├── .env                 # Environment variables
│   ├── uploads/             # Uploaded location images
│   └── data.json            # Database file (auto-created)
│
└── README.md                # This file
```

---

## 🔌 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| **Frontend** | 3001 | http://localhost:3001 |
| **Backend API** | 8001 | http://localhost:8001 |

### Important: API URL in Frontend

The frontend is configured to communicate with the backend on **port 8001**.
This is set in `frontend/public/app.js`:

```javascript
const API_URL = 'http://localhost:8001/api';
```

---

## 💾 Backend Configuration

### Environment Variables (.env)

Create a `.env` file in the `backend/` directory:

```env
PORT=8001

# WhatsApp Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP_NUMBER=whatsapp:+your_admin_number_here
```

### WhatsApp Integration

To enable WhatsApp notifications for orders:

1. Sign up at [Twilio](https://www.twilio.com/console)
2. Get your Twilio credentials
3. Update the `.env` file with your credentials
4. Restart the backend server

**Demo Mode**: Without Twilio credentials, WhatsApp messages are logged to console instead of being sent.

---

## 🎯 Features

✅ **User Authentication**
- Register new accounts
- Secure login
- Session management

✅ **Order Management**
- Place orders with quantity
- Upload location photos
- Provide contact details
- Track order status

✅ **WhatsApp Integration**
- Auto-notify admin on new orders
- Customer status updates
- Order details via WhatsApp

✅ **Responsive Design**
- Mobile-friendly interface
- Works on all devices
- Modern UI with smooth animations

---

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Express.js (web server)
- No build step required

### Backend
- Python 3.8+
- FastAPI (REST API framework)
- Uvicorn (ASGI server)
- Pydantic (data validation)
- Python-multipart (file uploads)

---

## ⚙️ Installation & Setup

### Prerequisites:
- Node.js v14+ (for frontend)
- Python 3.8+ (for backend)
- npm (comes with Node.js)
- pip (comes with Python)

### Complete Setup:

**Step 1: Frontend Setup**
```bash
cd frontend
npm install
```

**Step 2: Backend Setup**
```bash
cd backend
pip install -r requirements.txt
```

**Step 3: Environment Configuration**
- Copy `backend/.env.example` to `backend/.env`
- Update with your Twilio credentials (optional)

**Step 4: Start Services**

Terminal 1 - Backend:
```bash
cd backend
python main.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

**Step 5: Access Website**
- Frontend: http://localhost:3001
- Backend API: http://localhost:8001

---

## 📝 Database Structure

### Users Collection
```json
{
  "id": 1234567890,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "plain_text_password",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Orders Collection
```json
{
  "id": 1234567890,
  "userId": 1234567890,
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "quantity": 5,
  "contactNumber": "+1234567890",
  "location": "123 Main St, City",
  "locationImage": "/uploads/image.jpg",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🎮 User Flow

### For Customer:
1. Visit `http://localhost:3001`
2. Sign up with name, email, phone, password
3. Login with credentials
4. Go to dashboard → "New Order"
5. Enter quantity, contact number, location
6. Upload location photo (optional)
7. Submit order
8. Admin receives WhatsApp notification
9. Order status updates via WhatsApp

### For Admin:
1. Access all orders via `GET /api/admin/orders`
2. Update order status via `PUT /api/admin/orders/{order_id}`
3. Customer automatically notified via WhatsApp

---

## 🔐 Security Notes

⚠️ **For Production:**
1. Use bcrypt to hash passwords instead of plain text
2. Implement JWT authentication tokens
3. Use PostgreSQL/MongoDB instead of JSON storage
4. Add input validation and sanitization
5. Enable HTTPS/TLS
6. Implement rate limiting
7. Add CORS restrictions
8. Use environment variables for secrets

---

## 🚀 Future Enhancements

📋 Planned features:
- Payment gateway integration (Stripe, Razorpay)
- Real-time GPS tracking
- Subscription plans
- Admin dashboard
- Driver app
- Review system
- Multiple delivery addresses
- Promotional codes
- Email notifications

---

## 🆘 Troubleshooting

### Frontend not loading?
- Check if frontend server is running on port 3001
- Open browser console (F12) for errors
- Verify backend API is accessible on 8001

### API calls failing?
- Check backend server is running on port 8001
- Verify CORS is enabled in FastAPI
- Check .env file configuration
- Look at backend console for error messages

### WhatsApp messages not sending?
- Verify Twilio credentials in .env
- Check phone number format (include country code: +1234567890)
- Ensure numbers are in E.164 format

### File upload not working?
- Ensure `backend/uploads/` directory exists
- Check file permissions
- Verify `python-multipart` is installed

### Port already in use?
- Change port in respective server files or kill existing process

---

## 📄 License

MIT License - Feel free to use for personal or commercial purposes.

---

**Made with 💧 for easy water delivery**
