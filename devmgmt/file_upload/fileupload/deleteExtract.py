import shutil,os,sys,json

sys.path.append("/var/edgedevice/devmgmt/file_upload/")
os.environ['DJANGO_SETTINGS_MODULE']='file-upload.settings'
import django
from django.conf import settings

def deleteit(files):    
        print files
        content_path = settings.UNZIP_CONTENT
        json_dir_path = settings.JSON_DIR

        for filename in os.listdir(content_path):
                if filename in files:
                        print 'deleted folder '+filename
                        files.remove(filename)
                        shutil.rmtree(content_path+filename)
        
        
        print files             
        
        #removing the .json files
        for filename in os.listdir(json_dir_path):
                if filename in files:
                        print 'deleted file '+filename
                        files.remove(filename)
                        os.remove(json_dir_path+filename)
