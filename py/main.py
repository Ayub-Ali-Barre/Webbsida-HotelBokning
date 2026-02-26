from fastapi import FastAPI
from pydantic import BaseModel
import mysql.connector
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi.middleware.cors import CORSMiddleware

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

@app.post("/register")
def register(user: User):

    hashed_password = ph.hash(user.password)

    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="testdb"
    )

    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO users (email, password, fullname, username) VALUES (%s, %s, %s, %s)",
        (user.email, hashed_password, user.fullname, user.username)
    )
    db.commit()

    cursor.close()
    db.close()

    return {"status": "ok"}