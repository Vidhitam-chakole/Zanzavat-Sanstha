# Run Doc — Zanzavat Sanstha Web Application

## How to Reproduce Artifacts
- No build step needed. This is a Flask application serving static HTML/CSS/JS files.
- The `.env` file should already be present in the project root (contains Supabase, mail, and Groq API keys).
- Python dependencies are listed in `requirements.txt` and should already be installed in the project's virtual environment.

## How to Run the Server
- From the project root, run: `python server.py`
- The Flask development server starts on **http://127.0.0.1:5000**
- Debug mode is enabled by default (auto-reloads on file changes).
- To run detached on Windows (PowerShell):
  ```powershell
  Start-Process -FilePath 'python' -ArgumentList 'server.py' -WindowStyle Hidden -PassThru
  ```
- On Unix-like shells:
  ```bash
  nohup python server.py &
  ```

## Project Structure
- HTML pages: `index.html`, `about.html`, `impact.html`, `programs.html`, `events.html`, `gallery.html`, `join.html`, `donate.html`, `contact.html`
- CSS: `public/assets/css/style.css`
- JS: `public/assets/js/main.js`, `public/assets/js/gallery.js`, `public/assets/js/events.js`
- Data: `public/assets/data/events.json`, `public/assets/data/contacts.json`, `public/assets/data/registrations.json`
- Server: `server.py` (Flask) with API endpoints `/api/register`, `/api/contact`, `/api/chat`
