from fastapi import FastAPI
from pydantic import BaseModel
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
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

    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO users (email, password) VALUES (%s, %s)",
        (user.email, user.password)
    )
    db.commit()

    cursor.close()
    db.close()

    return {"status": "ok"}
