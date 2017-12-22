# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import subprocess
import json

CONFIG_FILE = '/opt/opencdn/CDN/profile.json'
print 'CONFIG_FILE ' + CONFIG_FILE
ACCEPTED_EXTNS = []
with open(CONFIG_FILE) as res_file:
    json_data = json.load(res_file)

    ACTIVE_PROFILE = json_data["active_profile"]
    MEDIA_ROOT = json_data["available_profiles"][ACTIVE_PROFILE].get("media_root", "")
    CONTENT_ROOT = json_data["available_profiles"][ACTIVE_PROFILE].get("content_root", "")
    CDN_URL = json_data["available_profiles"][ACTIVE_PROFILE].get("cdn_url", "")
    JSON_DIR = json_data["available_profiles"][ACTIVE_PROFILE].get("json_dir", "")
    CONFIG_JSON_DIR = json_data["available_profiles"][ACTIVE_PROFILE].get("config_json_dir", "")
    CONFIG_JSON_NAME = json_data["available_profiles"][ACTIVE_PROFILE].get("config_json_name", "")
    UNZIP_CONTENT = json_data["available_profiles"][ACTIVE_PROFILE].get("unzip_content", "")
    TELEMETRY = json_data["available_profiles"][ACTIVE_PROFILE].get("telemetry", "")
    USB_ON_AUTOMOUNT = json_data["available_profiles"][ACTIVE_PROFILE].get("usb_on_automount", "")
    SERVER_ROOT = json_data["available_profiles"][ACTIVE_PROFILE].get("server_root", "")
    ACCEPTED_EXTNS = json_data["available_profiles"][ACTIVE_PROFILE].get("accepted_extensions", "")
    CDN_SCRIPTS_DIR = json_data["available_profiles"][ACTIVE_PROFILE].get("cdn_scripts_dir", "")
    USB_DIR = json_data["available_profiles"][ACTIVE_PROFILE].get("usb_dir", "")
    print ACCEPTED_EXTNS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
print 'BASe_Dir = %s' %(BASE_DIR)
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '9%$in^gpdaig@v3or_to&_z(=n)3)$f1mr3hf9e#kespy2ajlo'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [subprocess.check_output(" x=\"$(ifconfig wlan0 | grep \"inet \" | awk -F'[: ]+' '{ print $4 }')\";echo $x", stderr = subprocess.STDOUT, shell=True).replace('\n', ''), '127.0.0.1', '*']
#ALLOWED_HOSTS = [subprocess.check_output(" x=\"$(hostname -I | awk -F'[: ]+' '{ print $4 }')\";echo $x", stderr = subprocess.STDOUT, shell=True).replace('\n', ''), '127.0.0.1']
print 'ALLOWED HOSTS IS %s' %(ALLOWED_HOSTS)

# Application definition

INSTALLED_APPS = (
        'createuser.apps.CreateuserConfig',
        'backadmin.apps.BackadminConfig',
        'changevars.apps.ChangevarsConfig',
        'changepermissions.apps.ChangepermissionsConfig',
        'changecaptive.apps.ChangecaptiveConfig',
        'ssidmod.apps.SsidmodConfig',
        'fileupload.apps.FileuploadConfig',
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        )

MIDDLEWARE_CLASSES = (
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
        'django.middleware.security.SecurityMiddleware',
        )

ROOT_URLCONF = 'file-upload.urls'

TEMPLATES = [
        {
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            #'DIRS': ['file-upload/templates'],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.debug',
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                    ],
                },
            },
        ]

WSGI_APPLICATION = 'file-upload.wsgi.application'


DB_DIR = '/opt/opencdnDB/'
DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(DB_DIR, 'db'),
            'OPTIONS': {
                'timeout': 60
                }
            }
        }


LC_ALL="en_US.UTF-8"
LC_LANG="en_US.UTF-8"

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

STATICFILES_DIRS = [
        'file-upload/static',
        '/var/www/ekstep/',
        ]

DATA_UPLOAD_MAX_NUMBER_FIELDS=None
DATA_UPLOAD_MAX_MEMORY_SIZE=None

MEDIA_URL = CONTENT_ROOT
print 'MEDIA_URL = ' + MEDIA_URL
MEDIA_ROOT = MEDIA_URL
