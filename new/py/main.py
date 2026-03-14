import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import mysql.connector
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi.middleware.cors import CORSMiddleware

from jose import jwt
from datetime import datetime, timedelta
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import List
from fastapi.responses import RedirectResponse


RAPIDAPI_KEY = "a4ce23d0d1msh3ffd6b92f83b59bp1a2d83jsn9a2321b1fd2e"
SECRET_KEY = "KEY"

app = FastAPI()
ph = PasswordHasher()


app.add_middleware(
    CORSMiddleware,
       allow_origins=[
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5501"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


conf = ConnectionConfig(
    MAIL_USERNAME="aurorahotelsupport@gmail.com",
    MAIL_PASSWORD="azae kkjx zrld emvf",
    MAIL_FROM="aurorahotelsupport@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False
)

def create_verification_token(email: str):

    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return token


async def send_verification_email(email: str, token: str):

    verification_link = f"http://127.0.0.1:8000/verify-email/?token={token}"

    message = MessageSchema(
        subject="Verify your Aurora account",
        recipients=[email],
        body=f"""
Welcome to Aurora Hotels!

Click the link below to verify your email:

{verification_link}

If you did not create an account, ignore this email.
""",
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)



class User(BaseModel):
    email: str
    password: str
    username: str
    fullname: str


class LoginUser(BaseModel):
    email: str
    password: str



class BookingRequest(BaseModel):
    user_id: int
    hotel_id: str
    hotel_name: str
    check_in: str
    check_out: str
    guests: int
  


@app.post("/register")
def register(user: User):

    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="testdb"
    )

    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT id FROM users WHERE email=%s", (user.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = ph.hash(user.password)

    cursor.execute(
        "INSERT INTO users (email, password, fullname, username) VALUES (%s, %s, %s, %s)",
        (user.email, hashed_password, user.fullname, user.username)
    )

    db.commit()

    cursor.close()
    db.close()

    return {"status": "registered"}


@app.post("/login")
def login(user: LoginUser):

    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="testdb"
    )

    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email=%s", (user.email,))
    db_user = cursor.fetchone()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    try:
        ph.verify(db_user["password"], user.password)

        return  {
        "status": "login success",
        "user": {
            "id": db_user["id"],
            "email": db_user["email"],
            "username": db_user["username"],
            "fullname": db_user["fullname"],
            "is_verified": db_user["is_verified"]
        }
    }
    except VerifyMismatchError:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
@app.get("/hotels")
def get_hotels():

    url = "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels"

    from datetime import datetime, timedelta

    today = datetime.today()
    arrival_date = today.strftime("%Y-%m-%d")
    departure_date = (today + timedelta(days=3)).strftime("%Y-%m-%d")

    querystring = {
    "dest_id": "-1456928",
    "search_type": "CITY",
    "arrival_date": arrival_date,
    "departure_date": departure_date,
    "adults": "2",
    "room_qty": "1",
    "page_number": "1"
    }

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "booking-com15.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)

    print("STATUS:", response.status_code)
    print("BODY:", response.text)

    data = response.json()

    if not data.get("data"):
        print("API returned error:", data)
        return []

    hotels = []

    for h in data["data"]["hotels"][:12]:

        property = h["property"]

        hotels.append({
            "id": str(property.get("id")),
            "name": property.get("name"),
            "location": property.get("wishlistName"),
            "image": property.get("photoUrls", [""])[0],
            "pricePerNight": property.get("priceBreakdown", {}).get("grossPrice", {}).get("value", 200),
            "description": "Luxury stay in the heart of the city",
            "rating": property.get("reviewScore", 4.5),
            "reviews": property.get("reviewCount", 0),
            "amenities": ["Wifi","Pool","Breakfast"],
            "category": "Luxury"
        })

    return hotels

@app.post("/book")
def book_hotel(booking: BookingRequest):

    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="testdb"
    )

    cursor = db.cursor(dictionary=True)

    from datetime import datetime

    checkin = datetime.fromisoformat(booking.check_in)
    checkout = datetime.fromisoformat(booking.check_out)

    nights = (checkout - checkin).days

    if nights <= 0:
        raise HTTPException(status_code=400, detail="Invalid dates")

    response = requests.get("https://dummyjson.com/products/" + booking.hotel_id)
    data = response.json()

    price_per_night = 200

    total_price = round(price_per_night * nights * 1.1)

    cursor.execute("""
        INSERT INTO bookings
        (user_id, hotel_id, hotel_name, check_in, check_out, guests, total_price)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (
        booking.user_id,
        booking.hotel_id,
        booking.hotel_name,
        booking.check_in,
        booking.check_out,
        booking.guests,
        total_price
    ))

    db.commit()

    cursor.close()
    db.close()

    return {
        "status": "booking success",
        "total_price": total_price,
        "nights": nights
    }




@app.get("/my-bookings/{user_id}")
def get_bookings(user_id: int):

    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="testdb"
    )

    cursor = db.cursor(dictionary=True)

    cursor.execute("""
    SELECT id, hotel_name, check_in, check_out, guests, total_price
    FROM bookings
    WHERE user_id=%s
    ORDER BY created_at DESC
    LIMIT 5
    """, (user_id,))

    bookings = cursor.fetchall()

    cursor.close()
    db.close()

    return bookings





@app.delete("/booking/{booking_id}")
def delete_booking(booking_id: int):
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="testdb"
    )
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT id FROM bookings WHERE id=%s", (booking_id,))
    if not cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Booking not found")

    cursor.execute("DELETE FROM bookings WHERE id=%s", (booking_id,))
    db.commit()

    cursor.close()
    db.close()

    return {"status": "booking deleted"}



@app.get("/hotel/{hotel_id}")
def get_hotel_details(hotel_id: str):

    url = "https://booking-com.p.rapidapi.com/v1/hotels/data"

    querystring = {
        "hotel_id": hotel_id
    }

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "booking-com.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Hotel API error")

    data = response.json()

    return data


@app.post("/send-verification/{user_id}")
async def send_verification(user_id: int):

    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="testdb"
    )

    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT email, is_verified FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user["is_verified"]:
        raise HTTPException(status_code=400, detail="Already verified")

    token = create_verification_token(user["email"])

    await send_verification_email(user["email"], token)

    return {"status": "verification sent"}



@app.get("/verify-email/")
def verify_email(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")

        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="testdb"
        )
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT id, is_verified FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not user["is_verified"]:
            cursor.execute("UPDATE users SET is_verified=1 WHERE email=%s", (email,))
            db.commit()

        cursor.close()
        db.close()

        return RedirectResponse(url="http://127.0.0.1:5500/new/profile.html")

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")