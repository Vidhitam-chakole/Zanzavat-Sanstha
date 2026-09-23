import os
import sys

# Ensure root directory is on the Python path so server.py can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server import app


class VercelApiPathMiddleware:
  """Restores the original /api/<endpoint> path after Vercel's rewrite."""

  def __init__(self, application):
    self.application = application

  def __call__(self, environ, start_response):
    path = environ.get('PATH_INFO', '')
    prefix = '/api/index.py/'
    if path.startswith(prefix):
      environ['PATH_INFO'] = '/api/' + path[len(prefix):]
    return self.application(environ, start_response)


app.wsgi_app = VercelApiPathMiddleware(app.wsgi_app)

# Export WSGI application for Vercel
if __name__ == '__main__':
  app.run()
