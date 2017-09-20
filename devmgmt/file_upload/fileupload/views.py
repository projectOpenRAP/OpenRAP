# -*- coding: utf-8 -*-
import json, os, subprocess, getpass, shutil, sys
import logging

from .USBFinder import attemptMount,transfer_file, get_usb_name
from hashlib import sha1
from django.http import HttpResponse,HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.template import Context, loader
from django.shortcuts import render,get_object_or_404
from django.views.generic import CreateView, DeleteView, ListView
from .models import EkFile, Content
from django.contrib.auth.models import User
from .response import JSONResponse, response_mimetype
from .serialize import serialize
from django.urls import reverse
from .extract import extractit
from .deleteExtract import deleteit
from distutils.dir_util import copy_tree
from django.conf import settings

reload(sys)
sys.setdefaultencoding('utf-8')

staticFileLocRoot = None

old_files = []
files = []
total_amount = 0
total_done = 0
count = 0
is_auth = True
optional_flag = False
percentage_done = 0
perm_dict = None
user = None
telemetry = None
local_files = []
allowed_exts = settings.ACCEPTED_EXTNS
message = ''

class User_Permissions:
    def __init__(self, user):
        self.permissions = user.permission.get_permissions()

    def get_permissions(self):
        return self.permissions

class NoFilesError(ValueError):
    def __init__ (self, arg = None):
        self.strerror = arg
        self.args = {arg}

def user_logout(request):
    logout(request)
    return HttpResponseRedirect('../../upload/')

def index(request):
    return render(request,'fileupload/LOGIN.html')
'''
<<<<<<< HEAD
    
=======


   

Dev's code that is not actually called in the program, can be ignored, kept for future references if needed

>>>>>>> refs/remotes/origin/master
@ensure_csrf_cookie
def upload(request):
    if request.method=='POST':
        instance=EkFile(file=request.FILES['files'])
        obj=instance.save();
        print (instance)
        values=serialize(instance)
        data={"files":values}
        response=json.dumps(data)
        print (response)
        if instance.type_of_file=="ecar":
        	print instance.path_of_file
        	files=extractit(instance.path_of_file)
        	instance=Content(ekfile=instance,folder_file=files,json_file=files+".json")
        	instance.save()
        return HttpResponse(response,content_type="application/json")
        
@ensure_csrf_cookie
def list_the_files(request):
    values=[serialize(instance) for instance in EkFile.objects.all()]
    data={"files":values}
    response=json.dumps(data)
    print (response)
    return HttpResponse(response,content_type="application/json")
    
@ensure_csrf_cookie
def delete_files(request):
    print ("Delete this file: "+request.POST['id'])
    instance=EkFile.objects.get(id=request.POST['id'])
    print (instance)
    if instance.type_of_file=="ecar":
    	obj=Content.objects.get(ekfile=instance.id)
    	deleteit({'folder_file':obj.folder_file,'json_file':obj.json_file})
    	obj.delete()
    instance.delete()
    return HttpResponse(json.dumps({"id":4}),content_type="application/json")
<<<<<<< HEAD

'''

def verify(request, optional=False):
    flag='INIT'
    global optional_flag
    optional_flag = False
    global is_auth, user, password, telemetry
    if optional:
        optional_flag = True
        return HttpResponseRedirect('../new')
    try:
        user=User.objects.get(username=request.POST['email'])
        logger = logging.getLogger(__name__)
        password=request.POST.get('password', '')
    #_,salt,hashpw=user.password.split('$')
        logger.error(request.POST.get('email', '')+","+request.POST.get('password', '')+" \n")
        logger.error(user.password+", username is "+user.username)
        flag='REAL'
    except User.DoesNotExist:
        flag = 'FAKE'
    if(flag == 'REAL' and user.check_password(password)):
        global perm_dict
        perm_dict = User_Permissions(user)
        is_auth = True
        ############################################################
        # Load values from profile.json file                       #
        ############################################################
        staticFileLocRoot = settings.MEDIA_ROOT
        telemetry = settings.TELEMETRY
        
        return HttpResponseRedirect('new/')    
    else:
        return render(request,'fileupload/LOGIN.html',{'invalid':'not a valid username or password',})

#=======
config_json_dir = settings.CONFIG_JSON_DIR
config_json_name = settings.CONFIG_JSON_NAME

class EkFileCreateView(CreateView):
    model = EkFile
    fields = "__all__"

    def form_valid(self, form):
        self.object = form.save()
        print "self Object: "
        print unicode(self.object)
        self.object.file_upload = self.object.slug
        files = [serialize(self.object)]
        data = {'files': files}
        response = JSONResponse(data, mimetype=response_mimetype(self.request))
        response['Content-Disposition'] = 'inline; filename=files.json'
        print 'Before you send post request'
        print self.object.path_of_file
        print '-'*10 + 'EXTRACT' + '-'*10
        #print self.object.slug
        #if((self.object.slug.endswith(tuple(allowed_exts))) == 0):
         #   print "I am Not the right extension"
            #return HttpResponseRedirect('/upload/new/')
         #   return
        if(self.object.path_of_file.endswith(".json")):
            if not os.path.exists(config_json_dir):
                os.makedirs(config_json_dir)
            if(self.object.file_upload == config_json_name):
                os.system("killall -9 apiserver")
            shutil.copy2(self.object.path_of_file, config_json_dir)
            config_db_entry = EkFile.objects.get(file_upload=self.object.file_upload)
            config_db_entry.delete()
        else:
            if(settings.ACTIVE_PROFILE == "ekstep"): 
                files = extractit(self.object.path_of_file)
                for f in files:
                    obj=Content(ekfile=self.object,filename=f)
                    obj.save()

        return response

    def form_invalid(self, form):
        data = json.dumps(form.errors)
	print data + ' omg fail '
        return HttpResponse(content=data, status=400, content_type='application/json')




class EkFileDeleteView(DeleteView):
    model = EkFile

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        print 'Attempting to delete ' + unicode(self.object)
        if(self.object.path_of_file.endswith(".json")):
            json_file = unicode(self.object.file_upload)
            if(json_file == config_json_name):
                return HttpResponseRedirect('/upload/new/')
            file_name = config_json_dir+json_file
            os.remove(file_name)
        else:
            if(settings.ACTIVE_PROFILE == "ekstep"):
                files = Content.objects.filter(ekfile = self.object.id)
                filename = []
                for f in files:
                    filename.append(f.filename)
                    f.delete()
                deleteit(filename)
        self.object.delete()
        response = JSONResponse(True, mimetype=response_mimetype(request))
        response['Content-Disposition'] = 'inline; filename=files.json'
        return response


class EkFileListView(ListView):
    model = EkFile
    
    def render_to_response(self, context, **response_kwargs):
        files = [ serialize(p) for p in self.get_queryset() ]
        data = {'files': files}
        response = JSONResponse(data, mimetype=response_mimetype(self.request))
        response['Content-Disposition'] = 'inline; filename=files.json'
        return response

def verify_USB(request):
    value = attemptMount()
    response_data = 'disabled'
    if value is not None:
        response_data = 'active '
    return JsonResponse({'data':response_data})

def serve_extensions(requests):
    global allowed_exts
    return JSONResponse({"exts":allowed_exts})

def download_to_USBx(request):
    usb_name = get_usb_name()
    if usb_name is not None:
        local_files_dir = '/' + getpass.getuser() + '/FILES/'
        if os.geteuid() != 0:   #If not root, user location is /home/user/files
            local_files_dir = '/home/' + getpass.getuser() + '/FILES/'
	print local_files_dir
        local_files = []
        for root, folders, files in os.walk(local_files_dir):
            for file in files:
                if (not os.path.isdir(file)) and file.endswith(".json"):
                    local_files.append(os.path.join(root, file))
	print local_files
        actual_index = local_files[0].split('/').index('FILES') + 1
        for file in local_files:
            os.chdir('/media/' + getpass.getuser() + '/' + usb_name)
            split_list = file.split('/')
            for i in range (actual_index, len(split_list) - 1):
                if not os.path.exists(split_list[i]):
                    os.makedirs(split_list[i])
                os.chdir(split_list[i])
            command = 'cp "' + file + '" "' + os.getcwd() + '"'
            t = subprocess.Popen(command, shell=True)
            t.communicate()[0]
            result = t.returncode
            if result != 0:
                return JsonResponse ({'res': 'Copy aborted! [USB Unplugged/Insufficient Space?]'})
        return JsonResponse({'res': 'Copy successful'})
    return JsonResponse({'res':'Reinsert USB'})

'''
def download_to_USB(request):
    print request.method
    usb_name = get_usb_name()
    val = request.POST.get("counter", None)
    print "HAI " + str(val)
    if val is None:
        return HttpResponseRedirect('/upload/new/')
    if val == 'INIT':
        global local_files
        if usb_name is None:
            return HttpResponseRedirect('/upload/new/')
        local_files = []
        for root, folders, files in os.walk(telemetry):
            for file in files:
                if not os.path.isdir(file):
                    local_files.append(os.path.join(root, file))
        return JsonResponse({'value': '-1', 'length' : str(len(local_files))})
    else:
        try:
            current = int(val)
            curr_file = local_files[current]
            file_localized_name = curr_file[curr_file.find("telemetry") + len("telemetry/"):]
            shutil.copy2(curr_file, usb_name + file_localized_name)
            return JsonResponse({'value', str(current+1)})
        except ValueError:
            return JsonResponse({'res': 'Use an integer for manual inputs!'})
        except IndexError:
            return JsonResponse({'res': 'Files have been successfully copied!'})
        except OSError:
            return JsonResponse({'res': 'Copy error! USB unplugged/insufficient storage space?'})
'''


def split_dirs(text): #Splits the entire path to get the file name
    splitty = text.split('/')
    value = splitty[len(splitty) - 1]
    return value

def transfer(request):
    try:
        if not is_auth:
            return HttpResponse("Please access this URL properly")
        elif request.method == 'GET' or request.method == 'POST':
            global percentage_done
            global total_amount, total_done, count, files, old_files
            files_existing = []
            if request.method == 'GET':
                new_files = attemptMount()
                if new_files is None:
                    print "new_files none"
                    return HttpResponseRedirect('../new')
                old_files = [fModel.file_upload for fModel in EkFile.objects.all()]
                files = [thing for thing in new_files if split_dirs(thing) not in old_files]
                total_done = 0
                total_amount = len(files)
                print "total amount = " + str(total_amount)
                fileCount = 0
            else:
                fileCount = request.POST.get("file_descriptor", "")
                print "fileCount = " + str(fileCount)

            download_more = True
            file_to_transfer = None
            if len(files) > 0:
                temp_value = 0
                for file in files:
                    try:
                        #Runs each time. Can be optimized further to handle JSON requests and responses
                        value = split_dirs(file)
                        print "value = " + str(value)
                        x = EkFile.objects.get(file_upload=str(value))
                    except EkFile.DoesNotExist:
                        print "New File"
                        file_size = os.stat(file).st_size
                        value = split_dirs(file)
                        #file_to_transfer = files[int(fileCount)]
                        file_to_transfer = file
                        return_code = transfer_file(file_to_transfer)
                        if return_code != 0:
                            print 'USB unexpectedly removed!'
                            removeCorruptFile(file_to_transfer)
                            #Code below updates the file transferred list
                        if file_to_transfer is not None:
                            print "file_to_transfer " + file_to_transfer
                            value = split_dirs(file_to_transfer)
                            file_to_save = EkFile(file_upload = value)
                            file_to_save.save()
                            if(value.endswith(".json")):                                    
                                if not os.path.exists(config_json_dir):
                                    os.makedirs(config_json_dir)
                                if(value == config_json_name):
                                    os.system("killall -9 apiserver")
                                shutil.copy2(file_to_save.path_of_file, config_json_dir)
                                config_db_entry = EkFile.objects.get(file_upload=value)
                                config_db_entry.delete()
                            else:
                                if(settings.ACTIVE_PROFILE == "ekstep"):
                                    files2 = extractit(file_to_save.path_of_file)
                                    for f in files2:
                                        obj=Content(ekfile=file_to_save,filename=f)
                                        obj.save()
                            print '[Z]Saved ' + value

        return HttpResponseRedirect('../new')
        #return JsonResponse({'null':'null'}) #For testing only, report if thrown anytime!
    except OSError:
        global message
        message = "File upload failure!"
        return HttpResponseRedirect('../new/');

def removeCorruptFile(file):
    global staticFileLocRoot
    delete_from_db_file  = EkFile.objects.get(split_dirs(file))
    delete_from_db_file.delete()
    sendString = "rm " + staticFileLocRoot + file
    t = subprocess.Popen(sendString)
    t.communicate()[0]
