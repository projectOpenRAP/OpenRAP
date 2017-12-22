import os, threading
from os.path import isfile, join

#from django.core.management import setup_environ
#from file-upload import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "file-upload.settings")
import django
django.setup()
from fileupload.models import EkFile

##################################################
# On boot, clear database and repopulate using   #
# all available files in media directory. The    #
# format for the file is in database is:         #
# Name, type, absolue path (primary key?)        #
##################################################

def get_type(file):
	file_length = len(file)
	i = 0
	for i in range (file_length, 0):
		if file[i] == '.':
			break
	if i > 0:
		return file[i: file_length]
	return 'N/A'


cwd = os.getcwd()
files_directory = '/var/www/ekstep/ecar_files/'
EkFile.objects.all().delete()
list_of_file_dictionaries = []
local_files = []
for root, subfolders, files in os.walk(files_directory):
		for name in files:
			local_files.append(join(root, name))
print 'Existing files are: ' + str(local_files)
for file in local_files:
	temp_file_dict = {
		'name': file,
		'type': get_type(file),
		'path': join(files_directory,file)
	}
	list_of_file_dictionaries.append(temp_file_dict)

for dictionary in list_of_file_dictionaries:
	newFile = EkFile(file = dictionary['name'])
	newFile.save()

