import zipfile,os,shutil,sys,json

#sys.path.append("/var/edgedevice/devmgmt/file_upload/")
os.environ['DJANGO_SETTINGS_MODULE']='file-upload.settings'
import django
from django.http import HttpResponse
from django.conf import settings


def extractit(path_of_file):

    #ekstep file uploaded path obtained using file.path
        file_path=path_of_file

        zip_ref=zipfile.ZipFile(file_path,'r')

        index=file_path.find(".ecar")

        #folder name
        folder=file_path[:index]


        #create a folder for the ekstep file uploaded uisng its own name
        os.makedirs(folder)

        #ekstep file uploaded folder which contains the unzip version of the ekstep file uploaded
        zip_ref.extractall(folder)
        zip_ref.close()

        #renames the manifest file inside the ekstep file uploaded folder 

        index=file_path.rfind('/')
        file_name=file_path[index+1:]
        os.rename(folder+"/manifest.json",folder+"/"+file_name+".json")

        #list for storing the extracted items names
        content_list=[]

        #collects the folders and files extracted inside the content_list

        for filename in os.listdir(folder):
            content_list.append(filename)

        #print content_list

        content_path = settings.UNZIP_CONTENT
        json_dir_path = settings.JSON_DIR
        if not os.path.exists(content_path):
            os.makedirs(content_path)               
        if not os.path.exists(json_dir_path):
            os.makedirs(json_dir_path)

        #files list 

        #move the contents of the ekstep file uploaded folder

        for filename in os.listdir(folder):
            if(filename.endswith(".json")):
                shutil.move(folder+"/"+filename,json_dir_path+"/"+filename)
            else:
                try: 
                    shutil.move(folder+"/"+filename,content_path+"/"+filename)
                except:
                    print "This file already exists"
                    break

        #remove's the ekstep file uploaded folder which is empty right now 
        shutil.rmtree(folder)
        #name of the folder which we got after extracting .ecar file
        return content_list   
