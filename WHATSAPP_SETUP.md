# 📱 WhatsApp Integration Guide - WaterCan

## How to Get WhatsApp Notifications for Orders

Your backend is running on **http://localhost:8001** with FastAPI!

### Step-by-Step WhatsApp Setup

#### **Step 1: Create Twilio Account**
1. Go to: https://www.twilio.com/console/signup
2. Sign up with email (free account with $20 trial credits)
3. Verify your email

#### **Step 2: Get Your Credentials**
1. Log in to [Twilio Console](https://www.twilio.com/console)
2. Copy your **Account SID** (starts with AC...)
3. Copy your **Auth Token** (long string)
4. Go to **Messaging** → **Try it out** → **Send an SMS**
5. Copy your **Twilio Phone Number** (looks like: +1415523xxxx)

#### **Step 3: Enable WhatsApp Sandbox**
1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp**
2. You'll see a WhatsApp number (format: +1415523xxxx)
3. Save this number as **TWILIO_WHATSAPP_NUMBER**

#### **Step 4: Update Backend Configuration**

Edit `backend/.env` file:

```env
PORT=8001

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+1415523xxxx
ADMIN_WHATSAPP_NUMBER=whatsapp:+919876543210
```

**Replace:**
- `ACxx...` with your Account SID
- `xxxxxx...` with your Auth Token
- `+1415...` with your Twilio WhatsApp number
- `+91987...` with **your admin WhatsApp number** (the one that will receive notifications)

#### **Step 5: Join WhatsApp Sandbox**

1. From the Twilio WhatsApp console, you'll see: 
   > "To join the sandbox, send a WhatsApp message to [number] with code: **join xxxxx**"

2. Open WhatsApp on your phone
3. Send message to that Twilio number with the code shown
4. Wait for confirmation

#### **Step 6: Restart Backend**

Stop and restart the backend server:

```bash
cd backend
python main.py
```

---

## ✅ Testing WhatsApp

1. Open website: `http://localhost:3001`
2. Sign up and login
3. Place an order
4. Check Twilio Console → Messages for:
   - Order notification messages

---

## 🔍 What Happens When Order Is Placed?

### Customer Receives:
- ✅ Order confirmation message  
- ✅ Order ID and status updates

### Admin Receives:
- 📦 Order details
- 👤 Customer name & email
- 📱 Contact number
- 🏠 Delivery location
- 🚚 Quantity of cans
- 🕐 Order timestamp

**Example Message:**
```
📦 NEW WATER CAN ORDER

👤 Customer: John Doe
📧 Email: john@example.com
📱 Contact: 9876543210
🏠 Location: 123 Main St, City
🚚 Quantity: 10 cans
📍 Location Image: Uploaded
🕐 Order Time: 2026-03-01 10:30:45

Order ID: 1772358785
Status: Pending
```

---

## 🎯 Admin Panel Features

After setting up WhatsApp:

1. Login to website
2. Go to Dashboard
3. Click **Admin Panel** button
4. See all orders in a table
5. Change order status:
   - **pending** → Received
   - **confirmed** → Confirmed with customer
   - **in-transit** → On the way
   - **delivered** → Successfully delivered
   - **cancelled** → Cancelled

When you update status, customer automatically receives WhatsApp message!

---

## 🔗 Dashboard vs Admin Panel

### Dashboard (Your Orders)
- Shows only **your orders**
- Can place new orders
- Track your delivery

### Admin Panel (All Orders)
- Shows **all customer orders**
- Update order status
- Send WhatsApp notifications

---

## 🚀 Demo Mode (No Twilio Setup)

Don't have Twilio? No problem!

Orders work **without WhatsApp setup**:
1. Place order normally
2. Backend logs message to console
3. You can see order details in Admin Panel
4. Can still track orders

**To enable WhatsApp later:**
1. Get Twilio credentials
2. Update `.env` file
3. Restart backend
4. Done! ✅

---

## 📺 Twilio Console Features

Once set up, visit [Twilio Console Messages](https://www.twilio.com/console/sms/dashboard) to see:
- ✅ All messages sent
- ✅ Delivery status
- ✅ Message timestamps
- ✅ Error logs (if any)

---

## 🆘 Troubleshooting

### WhatsApp Messages Not Sending?

**Check 1:** Verify credentials in `backend/.env`
```bash
# Should have valid values:
TWILIO_ACCOUNT_SID=ACxxxxxxxx...
TWILIO_AUTH_TOKEN=yyyyyy...
```

**Check 2:** Phone number format
```
❌ Invalid:  7898765432
❌ Invalid:  919876543210
✅ Correct:  +919876543210  (with + and country code)
```

**Check 3:** Restart backend
```bash
cd backend
python main.py
```

**Check 4:** Check backend console
- Watch terminal for error messages
- Order should show in console even if WhatsApp fails

**Check 5:** Verify sandbox active
- Log in to [Twilio Console](https://www.twilio.com/console)
- Go to Messaging → Try it Out → WhatsApp
- Check if sandbox is active

---

## 💰 Twilio Pricing

- **Free account:** $20 trial credit
- **After trial:** ~$0.001 per message
- **Cost for 100 orders:** ~$0.10

---

## 🔐 Security Notes

⚠️ Never share:
- Account SID
- Auth Token
- In public repositories

✅ Use `.env` file (never commit to git)

---

## 📞 Getting Help

If issues:
1. Check Twilio Console for error messages
2. Verify phone number format (+country code)
3. Check `.env` file for typos
4. Restart backend server
5. Check browser console (F12) for API errors

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create Twilio account |
| 2 | Get credentials (SID, Token, Number) |
| 3 | Update `backend/.env` |
| 4 | Join WhatsApp sandbox |
| 5 | Restart backend |
| 6 | Test with order |

**Done!** You'll now receive WhatsApp messages when orders are placed! 🎉

---

**Backend Running:** http://localhost:8001  
**Frontend Running:** http://localhost:3001  
**Dashboard:** http://localhost:3001 (after login)  
**Admin Panel:** Click "Admin Panel" button in dashboard
