# 🚀 Quick Start Guide - WaterCan

## Architecture Overview

Your WaterCan application is now separated into **Frontend** and **Backend** for better organization and scalability:

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (Port 3001)                                   │
│  - User Interface (HTML, CSS, JavaScript)               │
│  - Express.js Server                                    │
│  - Runs at: http://localhost:3001                       │
└────────────────────┬────────────────────────────────────┘
                     │ API Calls
                     │ (http://localhost:8001/api)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND (Port 8001)                                    │
│  - FastAPI REST API                                     │
│  - Python Server                                        │
│  - Runs at: http://localhost:8001                       │
│  - Database: data.json                                  │
│  - WhatsApp Integration (Twilio)                        │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Quick Start (2 Terminals Required)

### Terminal 1: Start Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
✅ Backend will run on: **http://localhost:8001**

### Terminal 2: Start Frontend
```bash
cd frontend
npm install
npm start
```
✅ Frontend will run on: **http://localhost:3001**

---

## 🌐 Open in Browser

Visit: **http://localhost:3001**

---

## 📋 First Time Setup Checklist

- [ ] Backend dependencies installed (`backend/pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`frontend/npm install`)
- [ ] Backend running on port 8001 (sign: uvicorn logs appear)
- [ ] Frontend running on port 3001 (sign: npm start shows success message)
- [ ] Website loads at http://localhost:3001
- [ ] Can sign up and create account
- [ ] Can place an order with location image
- [ ] Backend console shows order received

---

## 🔑 Default Test User (Optional)

Frontend stores user data locally in JSON. No default user - create your own:

**Test Credentials:**
- Name: John Doe
- Email: john@example.com
- Phone: +91-1234567890
- Password: password123

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `frontend/public/app.js` | Frontend JavaScript - API calls |
| `frontend/public/index.html` | Frontend UI |
| `backend/main.py` | Backend API server |
| `backend/data.json` | Database (auto-created) |
| `backend/.env` | Configuration (optional) |

---

## 🎯 What Can You Do?

### As a User:
1. **Register** → Sign up with name, email, phone, password
2. **Login** → Access your account
3. **Order** → Place water can order with:
   - Quantity of cans
   - WhatsApp contact number
   - Delivery location
   - Location photo (optional)
4. **Track** → View order history and status

### As Admin:
1. **View Orders** → Access all orders via API
2. **Update Status** → Change order status
3. **Get Notifications** → Receive WhatsApp messages (when configured)

---

## ⚙️ WhatsApp Setup (Optional)

To enable WhatsApp notifications:

1. Create account at https://www.twilio.com/console
2. Get your Account SID and Auth Token
3. Update `backend/.env`:
   ```env
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   ADMIN_WHATSAPP_NUMBER=whatsapp:+91your_number
   ```
4. Restart backend server

**Without setup:** Orders still work, messages logged to console.

---

## 🔧 Ports Used

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3001 | Website UI |
| Backend | 8001 | REST API |

⚠️ If ports are busy, change in:
- Frontend: `frontend/server.js` (line with `3001`)
- Backend: `backend/main.py` (line with `port=8001`)

---

## 📋 Quick Commands

### Start Everything (from root folder)
```bash
# Terminal 1
cd backend && python main.py

# Terminal 2
cd frontend && npm start
```

### Install Dependencies
```bash
cd frontend && npm install
cd backend && pip install -r requirements.txt
```

### Reset Database
```bash
# Delete this file (will be recreated):
rm backend/data.json

# Or:
del backend\data.json  (Windows)
```

---

## ✨ Features

✅ User Registration & Login  
✅ Order Placement with Location Upload  
✅ Order History & Status Tracking  
✅ WhatsApp Notifications (Admin)  
✅ Responsive Mobile UI  
✅ No Build Step Required  

---

## 🆘 Common Issues

### "Cannot find module" (Frontend)
```bash
cd frontend
npm install
npm start
```

### "ModuleNotFoundError" (Backend)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Port Already in Use
```bash
# Find what's using the port and change it, or:
# Change port in server files
```

### API Connection Error
- Ensure backend is running on http://localhost:8001
- Check Firefox/Chrome console (F12) for actual error
- Verify frontend `app.js` has correct API_URL

---

## 📚 Documentation

For detailed info, see: `README.md`

---

## 🎓 Next Steps

1. Test signup and login
2. Place test order with location photo
3. Check backend console for order details
4. (Optional) Configure Twilio for WhatsApp
5. Customize colors/text in styles.css
6. Deploy to server/cloud

---

**Ready? Open http://localhost:3001 and start! 🚀**
