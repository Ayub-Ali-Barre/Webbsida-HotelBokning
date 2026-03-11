import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mysql.connector
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi.middleware.cors import CORSMiddleware

HOTELS_API_KEY = "b90c1934efe28f3b457c74085e520d1e9279e2e95275039fc003eab68113bcad"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ph = PasswordHasher()


class User(BaseModel):
    email: str
    password: str
    username: str
    fullname: str


class LoginUser(BaseModel):
    email: str
    password: str


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

        return {
            "status": "login success",
            "user": {
                "id": db_user["id"],
                "email": db_user["email"],
                "username": db_user["username"],
                "fullname": db_user["fullname"]
            }
        }

    except VerifyMismatchError:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    


@app.get("/hotels")
def get_hotels():

    url = "https://api.hotels-api.com/v1/hotels/search"

    params = {
        "city": "Paris",
        "limit": 12
    }

    headers = {
        "X-API-KEY": HOTELS_API_KEY
    }

    response = requests.get(url, params=params, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch hotels")

    data = response.json()

    hotels = []

    for h in data["data"]:

        hotels.append({
            "id": str(h["id"]),
            "name": h["name"],
            "location": h["city"] + ", " + h["country"],
            "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945",
            "pricePerNight": 200,
            "description": "Luxury stay in the heart of the city.",
            "rating": h.get("rating", 4.5),
            "reviews": 120,
            "amenities": h.get("amenities", ["Wifi", "Pool", "Breakfast"]),
            "category": "Luxury"
        })

    return hotels




class BookingRequest(BaseModel):
    user_id: int
    hotel_id: str
    hotel_name: str
    check_in: str
    check_out: str
    guests: int
  

@app.post("/book")
def book_hotel(booking: BookingRequest):

    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="testdb"
    )

    cursor = db.cursor(dictionary=True)

    # beräkna nätter
    from datetime import datetime

    checkin = datetime.fromisoformat(booking.check_in)
    checkout = datetime.fromisoformat(booking.check_out)

    nights = (checkout - checkin).days

    if nights <= 0:
        raise HTTPException(status_code=400, detail="Invalid dates")

    # Hämta hotell från dummy API för att få pris
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