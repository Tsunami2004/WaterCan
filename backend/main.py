from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import json
import os
from pathlib import Path
import shutil
from typing import Optional
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="WaterCan API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database file
DB_FILE = Path(__file__).parent / "data.json"
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Models
class User(BaseModel):
    name: str
    email: str
    password: str
    phone: str

class LoginRequest(BaseModel):
    email: str
    password: str

class OrderRequest(BaseModel):
    userId: int
    quantity: int
    contactNumber: str
    location: str

# Database functions
def get_database():
    if not DB_FILE.exists():
        DB_FILE.write_text(json.dumps({"users": [], "orders": []}, indent=2))
    return json.loads(DB_FILE.read_text())

def save_database(data):
    DB_FILE.write_text(json.dumps(data, indent=2))

def send_whatsapp_message(phone_number: str, message: str):
    """Send WhatsApp message via Twilio"""
    try:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_number = os.getenv("TWILIO_WHATSAPP_NUMBER", "+14155238886")
        
        if not account_sid or not auth_token:
            print(f"WhatsApp Message (Demo Mode):\n{message}\nTo: {phone_number}")
            return {"success": True, "demo": True}
        
        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        data = {
            "From": f"whatsapp:{twilio_number}",
            "To": f"whatsapp:{phone_number}",
            "Body": message
        }
        
        response = requests.post(url, data=data, auth=(account_sid, auth_token))
        return {"success": response.status_code == 201}
    except Exception as e:
        print(f"WhatsApp Error: {str(e)}")
        return {"success": False, "error": str(e)}

# Authentication Routes
@app.post("/api/auth/register")
async def register(user: User):
    db = get_database()
    
    if any(u["email"] == user.email for u in db["users"]):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    new_user = {
        "id": int(datetime.now().timestamp()),
        "name": user.name,
        "email": user.email,
        "password": user.password,
        "phone": user.phone,
        "createdAt": datetime.now().isoformat()
    }
    
    db["users"].append(new_user)
    save_database(db)
    
    return {
        "success": True,
        "message": "Registration successful",
        "user": {
            "id": new_user["id"],
            "name": new_user["name"],
            "email": new_user["email"],
            "phone": new_user["phone"]
        }
    }

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    db = get_database()
    
    user = next((u for u in db["users"] if u["email"] == request.email and u["password"] == request.password), None)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"]
        }
    }

# Orders Routes
@app.post("/api/orders/create")
async def create_order(
    userId: int = Form(...),
    quantity: int = Form(...),
    contactNumber: str = Form(...),
    location: str = Form(...),
    locationImage: Optional[UploadFile] = File(None)
):
    db = get_database()
    user = next((u for u in db["users"] if u["id"] == userId), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Save uploaded image
    location_image_path = None
    if locationImage:
        file_extension = Path(locationImage.filename).suffix
        file_name = f"{int(datetime.now().timestamp())}{file_extension}"
        file_path = UPLOAD_DIR / file_name
        
        with open(file_path, "wb") as f:
            content = await locationImage.read()
            f.write(content)
        
        location_image_path = f"/uploads/{file_name}"
    
    new_order = {
        "id": int(datetime.now().timestamp()),
        "userId": userId,
        "userName": user["name"],
        "userEmail": user["email"],
        "quantity": quantity,
        "contactNumber": contactNumber,
        "location": location,
        "locationImage": location_image_path,
        "status": "pending",
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    db["orders"].append(new_order)
    save_database(db)
    
    # Send WhatsApp to admin
    admin_message = f"""
📦 NEW WATER CAN ORDER RECEIVED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ORDER DETAILS:
Order ID: #{new_order['id']}
Status: 🔴 PENDING

👤 CUSTOMER INFO:
Name: {user['name']}
Email: {user['email']}
Phone: {contactNumber}

📍 DELIVERY LOCATION:
Address: {location}
Location Photo: {'✅ Uploaded' if location_image_path else '❌ Not provided'}

🚚 ORDER CONTENT:
Quantity: {quantity} water cans
Delivery Type: Home/Office Delivery

⏰ ORDER TIME:
{datetime.now().strftime('%d-%m-%Y %H:%M:%S')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next Steps:
1. Review order details
2. Confirm with customer ({contactNumber})
3. Update status in Admin Panel
4. Assign to delivery partner
5. Customer will be notified

Admin Panel: http://localhost:3001 (after login)
"""
    
    admin_phone = os.getenv("ADMIN_WHATSAPP_NUMBER", "").replace("whatsapp:", "")
    if admin_phone:
        send_whatsapp_message(admin_phone, admin_message)
    else:
        print(f"Demo WhatsApp Message:\n{admin_message}")
    
    return {
        "success": True,
        "message": "Order created successfully",
        "order": new_order
    }

@app.get("/api/orders/{user_id}")
async def get_orders(user_id: int):
    db = get_database()
    orders = [o for o in db["orders"] if o["userId"] == user_id]
    return {"success": True, "orders": orders}

@app.get("/api/admin/orders")
async def get_all_orders():
    db = get_database()
    return {"success": True, "orders": db["orders"]}

@app.put("/api/admin/orders/{order_id}")
async def update_order(order_id: int, status: str):
    db = get_database()
    order = next((o for o in db["orders"] if o["id"] == order_id), None)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order["status"] = status
    order["updatedAt"] = datetime.now().isoformat()
    save_database(db)
    
    # Send WhatsApp to customer
    customer_message = f"Your water can order (ID: {order_id}) status has been updated to: {status}"
    send_whatsapp_message(order["contactNumber"], customer_message)
    
    return {"success": True, "message": "Order updated", "order": order}

# Root route
@app.get("/")
async def root():
    return {
        "message": "WaterCan API",
        "version": "1.0.0",
        "endpoints": {
            "auth": ["/api/auth/register", "/api/auth/login"],
            "orders": ["/api/orders/create", "/api/orders/{user_id}", "/api/admin/orders", "/api/admin/orders/{order_id}"]
        }
    }

# Serve uploaded files
@app.get("/uploads/{file_name}")
async def get_upload(file_name: str):
    file_path = UPLOAD_DIR / file_name
    if file_path.exists():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    import uvicorn
    # allow port override from environment for flexibility
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
