import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "public" / "assets" / "data"
REGISTRATIONS_JSON = DATA_DIR / "registrations.json"
REGISTRATIONS_CSV = DATA_DIR / "registrations.csv"


def _ensure_files():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not REGISTRATIONS_JSON.exists():
        REGISTRATIONS_JSON.write_text("[]", encoding="utf-8")
    if not REGISTRATIONS_CSV.exists():
        REGISTRATIONS_CSV.write_text(
            "name,email,phone,interest,message,timestamp\n",
            encoding="utf-8",
        )


def _append_record(record):
    _ensure_files()
    try:
        entries = json.loads(REGISTRATIONS_JSON.read_text(encoding="utf-8") or "[]")
        if not isinstance(entries, list):
            entries = []
    except Exception:
        entries = []

    entries.append(record)
    REGISTRATIONS_JSON.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")

    with REGISTRATIONS_CSV.open("a", encoding="utf-8", newline="") as fh:
        fh.write(
            f"{record.get('name','')},{record.get('email','')},{record.get('phone','')},{record.get('interest','')},{record.get('message','')},{record.get('timestamp','')}\n"
        )


def handler(request, response):
    if request.method != "POST":
        return response.json({"status": "error", "message": "Method not allowed."}, status=405)

    try:
        body = request.body.decode("utf-8") if request.body else "{}"
        data = json.loads(body or "{}")
    except Exception:
        return response.json({"status": "error", "message": "Invalid JSON payload."}, status=400)

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    phone = str(data.get("phone", "")).strip()
    interest = str(data.get("interest", "")).strip()
    message = str(data.get("message", "")).strip()

    if not all([name, email, phone, interest, message]):
        return response.json({"status": "error", "message": "All fields are required."}, status=400)

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    record = {
        "name": name,
        "email": email,
        "phone": phone,
        "interest": interest,
        "message": message,
        "timestamp": timestamp,
    }

    try:
        _append_record(record)
    except Exception:
        pass

    return response.json({
        "status": "success",
        "message": "Volunteer registered successfully!",
    }, status=200)
