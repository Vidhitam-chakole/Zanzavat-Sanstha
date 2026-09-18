import os
import sys

# Ensure root directory is on the Python path so server.py can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server import app

# Export WSGI application for Vercel
if __name__ == '__main__':
    app.run()
