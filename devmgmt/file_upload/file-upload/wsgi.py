

import os

from django.core.wsgi import get_wsgi_application

LC_CTYPE='en_US.UTF-8'
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "file-upload.settings")

application = get_wsgi_application()
