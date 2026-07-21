import csv
import json
import os
import traceback
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_mail import Mail, Message
from dotenv import load_dotenv
from supabase import create_client

app = Flask(__name__, static_folder='.', static_url_path='')

load_dotenv()
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_USERNAME")

mail = Mail(app)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_ENABLED = bool(SUPABASE_URL and SUPABASE_KEY)
supabase = None

DATA_DIR = os.path.join(os.path.dirname(__file__), "public", "assets", "data")
REGISTRATIONS_JSON = os.path.join(DATA_DIR, "registrations.json")
REGISTRATIONS_CSV = os.path.join(DATA_DIR, "registrations.csv")
CONTACTS_JSON = os.path.join(DATA_DIR, "contacts.json")
CONTACTS_CSV = os.path.join(DATA_DIR, "contacts.csv")

PROTECTED_FILES = {".env", "server.py", "requirements.txt", ".gitignore", "database.db"}


def ensure_local_data_files():
    """Ensures local storage directories and JSON/CSV files exist for fallback."""
    os.makedirs(DATA_DIR, exist_ok=True)

    for path in (REGISTRATIONS_JSON, CONTACTS_JSON):
        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as f:
                json.dump([], f, indent=2, ensure_ascii=False)

    if not os.path.exists(REGISTRATIONS_CSV):
        with open(REGISTRATIONS_CSV, "w", newline="", encoding="utf-8") as f:
            fieldnames = ["name", "email", "phone", "interest", "message", "timestamp"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

    if not os.path.exists(CONTACTS_CSV):
        with open(CONTACTS_CSV, "w", newline="", encoding="utf-8") as f:
            fieldnames = ["name", "email", "phone", "subject", "message", "timestamp"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()


def init_supabase():
    """Initializes the Supabase client for cloud storage, with local fallback."""
    global supabase
    ensure_local_data_files()

    if not SUPABASE_ENABLED:
        print("[INFO] Supabase credentials not configured; using local fallback storage.")
        return

    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        # Check connectivity to registrations table
        supabase.table("registrations").select("*").limit(1).execute()
        print("[OK] Supabase client initialized successfully.")
    except Exception as e:
        print(f"[WARNING] Supabase initialization check failed: {e}")
        print("[INFO] Falling back to local storage.")
        supabase = None


def save_local_json(filepath, record):
    """Saves a record to a local JSON file."""
    with open(filepath, "r+", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = []
        if not isinstance(data, list):
            data = []
        data.append(record)
        f.seek(0)
        f.truncate()
        json.dump(data, f, indent=2, ensure_ascii=False)
    return record


def save_local_csv(filepath, record, fieldnames):
    """Saves a record to a local CSV file."""
    with open(filepath, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writerow(record)
    return record


def insert_registration(record):
    """Inserts a volunteer registration record into Supabase or falls back to local storage."""
    if supabase:
        try:
            response = supabase.table("registrations").insert(record).execute()
            return response.data
        except Exception as e:
            print(f"[WARNING] Supabase registration save failed; saving locally. Error: {e}")

    save_local_json(REGISTRATIONS_JSON, record)
    save_local_csv(
        REGISTRATIONS_CSV,
        record,
        ["name", "email", "phone", "interest", "message", "timestamp"],
    )
    return record


def insert_contact(record):
    """Inserts a contact submission record into Supabase or falls back to local storage."""
    if supabase:
        try:
            response = supabase.table("contacts").insert(record).execute()
            return response.data
        except Exception as e:
            print(f"[WARNING] Supabase contact save failed; saving locally. Error: {e}")

    save_local_json(CONTACTS_JSON, record)
    save_local_csv(
        CONTACTS_CSV,
        record,
        ["name", "email", "phone", "subject", "message", "timestamp"],
    )
    return record


def send_contact_email(name, email, phone, subject, message):
    """Sends a notification email for new contact form submissions."""
    if not app.config.get("MAIL_USERNAME") or not app.config.get("MAIL_PASSWORD"):
        print("[INFO] Mail credentials not set; skipping contact notification email.")
        return

    msg = Message(
        subject=f"New Contact Form - {subject}",
        sender=app.config["MAIL_USERNAME"],
        recipients=["zanzavatsanstha@gmail.com"]
    )

    msg.html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:30px;background:#f4f4f4;font-family:Arial,sans-serif;">

<table width="650" align="center" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 5px 15px rgba(0,0,0,.1);">

<tr>
<td style="background:#B71C1C;padding:25px;text-align:center;color:white;">
<h2 style="margin:0;">Zanzavat Bahuudeshiya Shaikshanik Sanstha</h2>
<p style="margin:8px 0 0;">Empowering Since 1995</p>
</td>
</tr>

<tr>
<td style="padding:30px;">
<h2 style="color:#B71C1C;">📩 New Contact Form Submission</h2>

<table width="100%" cellpadding="10" style="border-collapse:collapse;">
<tr style="background:#f7f7f7;">
<td><b>Name</b></td>
<td>{name}</td>
</tr>
<tr>
<td><b>Email</b></td>
<td>{email}</td>
</tr>
<tr style="background:#f7f7f7;">
<td><b>Phone</b></td>
<td>{phone}</td>
</tr>
<tr>
<td><b>Subject</b></td>
<td>{subject}</td>
</tr>
</table>

<h3 style="margin-top:30px;color:#B71C1C;">Message</h3>
<div style="background:#fafafa;padding:18px;border-left:5px solid #B71C1C;line-height:1.7;">
{message}
</div>

<hr style="margin:30px 0;">
<p><b>Submitted On:</b><br>{datetime.now().strftime("%d %B %Y • %I:%M %p")}</p>
<hr>
<p style="font-size:13px;color:#777;text-align:center;">
This email was automatically generated from the Zanzavat Sanstha website.
</p>

</td>
</tr>
</table>

</body>
</html>
"""
    mail.send(msg)


def send_registration_email(name, email, phone, interest, message):
    """Sends a notification email for new volunteer registrations."""
    if not app.config.get("MAIL_USERNAME") or not app.config.get("MAIL_PASSWORD"):
        print("[INFO] Mail credentials not set; skipping volunteer notification email.")
        return

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
    """Handles volunteer registration form requests, saving to Supabase (or local fallback)."""
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

        record = {
            "name": name,
            "email": email,
            "phone": phone,
            "interest": interest,
            "message": message,
            "timestamp": timestamp
        }

        insert_registration(record)

        try:
            send_registration_email(name, email, phone, interest, message)
        except Exception as mail_err:
            print(f"[WARNING] Volunteer registration notification email failed: {mail_err}")

        return jsonify({"status": "success", "message": "Volunteer registered successfully!"})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/contact', methods=['POST'])
def contact_message():
    """Handles general contact form inquiries, saving to Supabase (or local fallback)."""
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

        record = {
            "name": name,
            "email": email,
            "phone": phone,
            "subject": subject,
            "message": message,
            "timestamp": timestamp
        }

        insert_contact(record)

        try:
            send_contact_email(name, email, phone, subject, message)
        except Exception as mail_err:
            print(f"[WARNING] Contact form notification email failed: {mail_err}")

        return jsonify({"status": "success", "message": "Message saved successfully!"})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/<path:filename>')
def serve_static(filename):
    """Serves static files and resource directories, blocking access to sensitive config files."""
    basename = os.path.basename(filename)
    if filename.startswith('.') or basename in PROTECTED_FILES:
        return jsonify({"error": "Access denied"}), 403
    return send_from_directory('.', filename)


# Initialize Supabase client on startup
init_supabase()

if __name__ == '__main__':
    print("=========================================================")
    print(" Zanzavat Bahuudeshiya Shaikshanik Sanstha - Backend Server")
    print(" Established 1995. Now serving Nagpur, Maharashtra, India.")
    print(" Running locally on http://127.0.0.1:5000")
    print("=========================================================")
    app.run(debug=True, port=5000)
