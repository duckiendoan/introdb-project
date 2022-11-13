from flask import Flask
from config import Config
import mysql.connector

app = Flask(__name__)
app.config.from_object(Config)
app.config['JSON_AS_ASCII'] = False

db = mysql.connector.connect(
    host = app.config['MYSQL_HOST'],
    user = app.config['MYSQL_USERNAME'],
    password = app.config['MYSQL_PASSWORD'],
    database = app.config['MYSQL_DATABASE']
)
if db.is_connected():
    db_info = db.get_server_info()
    print(f"Connected to MySQL version {db_info}")

from app import routes