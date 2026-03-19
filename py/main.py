from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mysql.connector
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from datetime import datetime, timedelta
from fastapi.responses import RedirectResponse
import smtplib
from email.message import EmailMessage


SECRET_KEY = "KEY"

DB_HOST = "localhost"
DB_USER = "aurora_user"
DB_PASSWORD = ""
DB_NAME = "DB"

MAIL_USERNAME = "support@auroraresort.online"
MAIL_PASSWORD = "CHANGE_THIS_EMAIL_PASSWORD"
MAIL_FROM = "support@auroraresort.online"


app = FastAPI()
ph = PasswordHasher()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "https://auroraresort.online",
        "https://www.auroraresort.online"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )


hotels = [
    {
        "id": "1",
        "name": "Aurora Tokyo Palace",
        "location": "Tokyo",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        "pricePerNight": 320,
        "description": "Luxury stay in Tokyo center",
        "rating": 4.8,
        "reviews": 1200,
        "amenities": ["Wifi", "Pool", "Spa", "Gym"],
        "category": "Luxury"
    },
    {
        "id": "2",
        "name": "Aurora Paris Grand",
        "location": "Paris",
        "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
        "pricePerNight": 410,
        "description": "Elegant Parisian hotel",
        "rating": 4.7,
        "reviews": 900,
        "amenities": ["Wifi", "Breakfast", "Spa"],
        "category": "Luxury"
    },
    {
        "id": "3",
        "name": "Aurora New York Central",
        "location": "New York",
        "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
        "pricePerNight": 380,
        "description": "Manhattan luxury stay",
        "rating": 4.6,
        "reviews": 800,
        "amenities": ["Wifi", "Gym", "Bar"],
        "category": "Luxury"
    },
    {
        "id": "4",
        "name": "Aurora London Royal",
        "location": "London",
        "image": "https://images.unsplash.com/photo-1501117716987-c8e1ecb2101b",
        "pricePerNight": 350,
        "description": "Classic London luxury",
        "rating": 4.6,
        "reviews": 700,
        "amenities": ["Wifi", "Breakfast", "Spa"],
        "category": "Luxury"
    },
    {
        "id": "5",
        "name": "Aurora Rome Imperial",
        "location": "Rome",
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
        "pricePerNight": 290,
        "description": "Historic Italian elegance",
        "rating": 4.5,
        "reviews": 640,
        "amenities": ["Wifi", "Breakfast", "Pool"],
        "category": "Luxury"
    }
]

cities = [
    "Tokyo", "Paris", "New York", "London", "Rome",
    "Dubai", "Barcelona", "Amsterdam", "Singapore", "Berlin"
]

for i in range(6, 21):
    city = cities[i % len(cities)]
    hotels.append({
        "id": str(i),
        "name": f"Aurora {city} Residence",
        "location": city,
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        "pricePerNight": 200 + i * 10,
        "description": "Luxury stay in the heart of the city",
        "rating": 4.4,
        "reviews": 300 + i * 10,
        "amenities": ["Wifi", "Pool", "Breakfast"],
        "category": "Luxury"
    })


def create_verification_token(email: str):
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")



async def send_verification_email(email: str, token: str):

    verification_link = f"https://www.auroraresort.online/py/verify-email/?token={token}"

    msg = EmailMessage()
    msg["Subject"] = "Email verification for Aurora Resort account"
    msg["From"] = "support@auroraresort.online"
    msg["To"] = email

    msg.set_content(
        f"""Email verification required

You recently created an account at Aurora Resort.

To complete your registration, open the link below in your browser:

{verification_link}

If you did not create this account, no action is required.

Aurora Resort
Customer Support
support@auroraresort.online
https://www.auroraresort.online
""",
        charset="us-ascii"
    )

    with smtplib.SMTP("mail.privateemail.com", 587) as server:
        server.starttls()
        server.login("support@auroraresort.online", "DIN_PRIVATE_EMAIL_PASSWORD")
        server.send_message(msg)


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
    amenities_price: int = 0


@app.post("/register")
def register(user: User):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT id FROM users WHERE email=%s", (user.email,))
    if cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = ph.hash(user.password)

    cursor.execute(
        "INSERT INTO users (email, password, fullname, username, is_verified) VALUES (%s, %s, %s, %s, %s)",
        (user.email, hashed, user.fullname, user.username, False)
    )

    db.commit()
    cursor.close()
    db.close()

    return {"status": "registered"}


@app.post("/login")
def login(user: LoginUser):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email=%s", (user.email,))
    db_user = cursor.fetchone()

    cursor.close()
    db.close()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid login")

    try:
        ph.verify(db_user["password"], user.password)

        return {
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
        raise HTTPException(status_code=401, detail="Invalid login")


@app.get("/hotels")
def get_hotels(city: str | None = None):
    if city:
        return [h for h in hotels if h["location"].lower() == city.lower()]
    return hotels


@app.post("/book")
def book_hotel(booking: BookingRequest):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    checkin = datetime.fromisoformat(booking.check_in)
    checkout = datetime.fromisoformat(booking.check_out)
    nights = (checkout - checkin).days

    if nights <= 0:
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Invalid dates")

    hotel = next((h for h in hotels if h["id"] == booking.hotel_id), None)
    if not hotel:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Hotel not found")

    price = hotel["pricePerNight"]
    base_total = price * nights
    service_fee = round(base_total * 0.1)
    total_price = base_total + service_fee + booking.amenities_price

    cursor.execute("""
        INSERT INTO bookings
        (user_id, hotel_id, hotel_name, check_in, check_out, guests, total_price)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
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
        "nights": nights,
        "total_price": total_price
    }


@app.get("/my-bookings/{user_id}")
def get_bookings(user_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, hotel_name, check_in, check_out, guests, total_price
        FROM bookings
        WHERE user_id=%s
        ORDER BY created_at DESC
        LIMIT 5
    """, (user_id,))

    data = cursor.fetchall()

    cursor.close()
    db.close()

    return data


@app.delete("/booking/{booking_id}")
def delete_booking(booking_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT id FROM bookings WHERE id=%s", (booking_id,))
    booking = cursor.fetchone()

    if not booking:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Booking not found")

    cursor.execute("DELETE FROM bookings WHERE id=%s", (booking_id,))
    db.commit()

    cursor.close()
    db.close()

    return {"status": "deleted"}


@app.post("/send-verification/{user_id}")
async def send_verification(user_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT email, is_verified FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()

    cursor.close()
    db.close()

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

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT id, is_verified FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()

        if not user:
            cursor.close()
            db.close()
            raise HTTPException(status_code=404, detail="User not found")

        if not user["is_verified"]:
            cursor.execute("UPDATE users SET is_verified=1 WHERE email=%s", (email,))
            db.commit()

        cursor.close()
        db.close()

        return RedirectResponse(url="https://www.auroraresort.online/profile.html")

    except ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")


@app.get("/user-status/{user_id}")
def user_status(user_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT is_verified FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()

    cursor.close()
    db.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"is_verified": user["is_verified"]}