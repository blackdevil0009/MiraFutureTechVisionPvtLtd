import sqlite3
import os

DATABASE = "internship_applications.db"

def migrate():
    if not os.path.exists(DATABASE):
        print(f"Database {DATABASE} not found. Skipping migration.")
        return

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # Check if duration column exists
    cursor.execute("PRAGMA table_info(applications)")
    columns = [column[1] for column in cursor.fetchall()]

    if "duration" not in columns:
        print("Adding 'duration' column to 'applications' table...")
        cursor.execute("ALTER TABLE applications ADD COLUMN duration TEXT DEFAULT 'Not Specified'")
        conn.commit()
        print("Migration successful.")
    else:
        print("'duration' column already exists.")

    conn.close()

if __name__ == "__main__":
    migrate()
