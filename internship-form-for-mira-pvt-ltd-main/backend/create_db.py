import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def create_db():
    print("Attempting to connect to MySQL...")
    try:
        # Connect to MySQL without specifying a database
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Devil@2007%"
        )
        cursor = conn.cursor()
        
        # Create database
        print("Executing CREATE DATABASE query...")
        cursor.execute("CREATE DATABASE IF NOT EXISTS mira_internship")
        print("Database 'mira_internship' created successfully or already exists.")
        
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"MySQL Error: {err}")
    except Exception as e:
        print(f"General Error: {e}")

if __name__ == "__main__":
    create_db()
