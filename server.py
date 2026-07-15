import os
import json
import csv
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_mail import Mail, Message
from dotenv import load_dotenv

app = Flask(__name__, static_folder='.', static_url_path='')

load_dotenv()
    
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")

mail = Mail(app)


# Files to store records locally
DB_FILE = 'database.db'
DATA_DIR = os.path.join('public', 'assets', 'data')
REGISTRATIONS_FILE = os.path.join(DATA_DIR, 'registrations.json')
REGISTRATIONS_CSV = os.path.join(DATA_DIR, 'registrations.csv')
CONTACTS_FILE = os.path.join(DATA_DIR, 'contacts.json')
CONTACTS_CSV = os.path.join(DATA_DIR, 'contacts.csv')

def init_sqlite_db():
    """
    Initializes the SQLite database.
    Creates registrations and contacts tables if they do not exist.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Create registrations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                interest TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        ''')
        
        # Create contacts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        ''')
        
        conn.commit()
        conn.close()
        print("[OK] SQLite Database successfully initialized (database.db).")
    except Exception as e:
        print(f"[ERROR] Database initialization error: {e}")

def save_to_json(file_path, data):
    """Appends data record to the target JSON array."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    records = []
    
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                records = json.load(f)
                if not isinstance(records, list):
                    records = []
        except Exception:
            records = []
            
    records.append(data)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

def save_to_csv(file_path, headers, row_data):
    """
    Appends a row to an Excel-compatible CSV file.
    Creates the headers if the file does not exist.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    file_exists = os.path.exists(file_path)
    
    with open(file_path, 'a', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(headers)
        writer.writerow(row_data)


def send_contact_email(name, email, phone, subject, message):

    print("===== EMAIL FUNCTION STARTED =====")
    msg = Message(
        subject=f"New Contact Form - {subject}",
        sender=app.config["MAIL_USERNAME"],
        recipients=["zanzavatsanstha@gmail.com"]
    )

    msg.body = f"""
New Contact Form Submission

Name:
{name}

Email:
{email}

Phone:
{phone}

Subject:
{subject}

Message:
{message}
"""

    mail.send(msg)
    print("Username:", app.config["MAIL_USERNAME"])
    print("Password:", repr(app.config["MAIL_PASSWORD"]))
    print("===== EMAIL SENT =====")
    
def send_registration_email(name, email, phone, interest, message):

    msg = Message(
        subject=f"New Volunteer Registration - {name}",
        sender=app.config["MAIL_USERNAME"],
        recipients=["chakolevidhitam@gmail.com"]
    )

    msg.body = f"""
New Volunteer Registration

Full Name:
{name}

Email:
{email}

Phone:
{phone}

Area of Interest:
{interest}

Motivation:
{message}
"""

    mail.send(msg)

@app.route('/')
def serve_index():
    """Serves the home page."""
    return send_from_directory('.', 'index.html')

@app.route('/api/register', methods=['POST'])
def register_volunteer():
    """Handles volunteer registration form requests, saving to SQLite, JSON, and CSV."""
    try:
        data = request.json or {}
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        interest = data.get('interest', '').strip()
        message = data.get('message', '').strip()
        
        if not all([name, email, phone, interest, message]):
            return jsonify({"status": "error", "message": "All fields are required."}), 400
            
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # 1. Save to SQLite SQL Database
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO registrations (name, email, phone, interest, message, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (name, email, phone, interest, message, timestamp))
        conn.commit()
        conn.close()
        
        record = {
            "name": name,
            "email": email,
            "phone": phone,
            "interest": interest,
            "message": message,
            "timestamp": timestamp
        }
        
        # 2. Save to JSON Database
        save_to_json(REGISTRATIONS_FILE, record)
        
        # 3. Save to Excel-compatible CSV
        csv_headers = ['Timestamp', 'Full Name', 'Email Address', 'Phone Number', 'Area of Interest', 'Motivation Message']
        csv_row = [timestamp, name, email, phone, interest, message]
        save_to_csv(REGISTRATIONS_CSV, csv_headers, csv_row)

        send_registration_email(
    name,
    email,
    phone,
    interest,
    message
)
        
        return jsonify({"status": "success", "message": "Volunteer registered successfully!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/contact', methods=['POST'])
def contact_message():
    """Handles general contact form inquiries, saving to SQLite, JSON, and CSV."""
    try:
        data = request.json or {}
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        
        if not all([name, email, phone, subject, message]):
            return jsonify({"status": "error", "message": "All fields are required."}), 400
            
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # 1. Save to SQLite SQL Database
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO contacts (name, email, phone, subject, message, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (name, email, phone, subject, message, timestamp))
        conn.commit()
        conn.close()
        
        record = {
            "name": name,
            "email": email,
            "phone": phone,
            "subject": subject,
            "message": message,
            "timestamp": timestamp
        }
        
        # 2. Save to JSON Database
        save_to_json(CONTACTS_FILE, record)
        
        # 3. Save to CSV
        csv_headers = ['Timestamp', 'Sender Name', 'Email Address', 'Phone Number', 'Subject', 'Message Body']
        csv_row = [timestamp, name, email, phone, subject, message]
        save_to_csv(CONTACTS_CSV, csv_headers, csv_row)

        send_contact_email(
    name,
    email,
    phone,
    subject,
    message
)
        
        return jsonify({"status": "success", "message": "Message saved successfully!"})
    except Exception as e:
     import traceback
     traceback.print_exc()

     return jsonify({
            "status": "error",
            "message": str(e)
    }), 500
    

@app.route('/<path:filename>')
def serve_static(filename):
    """Serves static files and resource directories."""
    return send_from_directory('.', filename)

# Initialize database on startup
init_sqlite_db()

if __name__ == '__main__':
    print("=========================================================")
    print(" Zanzavat Bahuudeshiya Shaikshanik Sanstha - Backend Server")
    print(" Established 1995. Now serving Nagpur, Maharashtra, India.")
    print(" Running locally on http://127.0.0.1:5000")
    print("=========================================================")
    app.run(debug=True, port=5000)
