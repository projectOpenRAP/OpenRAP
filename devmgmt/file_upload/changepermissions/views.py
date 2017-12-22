# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from fileupload.models import Permission
from django.core import serializers
from pprint import pprint
from django.forms.models import model_to_dict
from django.contrib.auth.decorators import login_required
from collections import OrderedDict

# Create your views here.
user_list = None
permission_strings = None


def update_data(request):
    if request.method == 'POST':
        global user_list, permission_strings
        if user_list is None:
            user_list = [user for user in User.objects.all() if not user.is_superuser]
        for user in user_list:
            for p in permission_strings:
                result = request.POST.get(str(user) + '_' + str(p), "off")
                obj = Permission.objects.get(user = user)
                setattr(obj, p, result == "on")
                obj.save()                              #Saving the permission object is much easier than saving the user object
                #print (getattr(newser.permission, p))
    return HttpResponseRedirect('/createuser/new/')

@login_required(login_url="/backadmin/")
def index(request):
    return HttpResponseRedirect('/')

@login_required(login_url="/backadmin/")
def display(request):
    if request.method == 'POST':
        global permission_strings
        pkey = request.POST.get("edit_me", None)
        pkey = int(pkey)
        user = User.objects.get(pk = pkey)
        permission_list = Permission._meta.get_fields()
        permission_list = permission_list[2:]
        sdict = {}
        permission_strings = []
        for i in range(0,len(permission_list)):
            index = str(permission_list[i]).rfind('.')
            permission = str(permission_list[i])[index+1:]
            permission_strings.append(permission)
        permission_strings = sorted(permission_strings)
        user_perms = model_to_dict(Permission.objects.get(user = user))
        user_perms.pop('id', None)
        user_perms.pop('user', None)
        sorted_perms = OrderedDict()
        for perm in permission_strings:
            sorted_perms[perm] = user_perms[perm]
        sdict[str(user)] = sorted_perms
        return render(request, 'changepermissions/change.html', 
        {'permission_list' : permission_strings, 'user_list' : list(str(user)), 'permission_dict' : sdict})
    return HttpResponseRedirect('../backadmin')
'''
    #Below code is to show the permissions for every user


    global user_list, permission_strings
    user_list = [user for user in User.objects.all() if not user.is_superuser]
    permission_list = Permission._meta.get_fields()
    permission_list = permission_list[2:]
    permission_strings = []
    user_perms_data = serializers.serialize("python", Permission.objects.all())
    for i in range(0,len(permission_list)):
        index = str(permission_list[i]).rfind('.')
        permission = str(permission_list[i])[index+1:]
        permission_strings.append(permission)
    permission_strings = sorted(permission_strings)
    permission_dictionary = {}
    for user in user_list:
        model_as_dict = model_to_dict(Permission.objects.get(user = user))
        model_as_dict.pop('id', None)
        model_as_dict.pop('user', None)
        print model_as_dict
        sorted_dict = OrderedDict()
        for perm in permission_strings:
            sorted_dict[perm] = model_as_dict[perm]
        permission_dictionary[str(user)] = sorted_dict
    return render(request, 'changepermissions/change.html', 
        {'permission_list' : permission_strings, 'user_list' : user_list, 'permission_dict' : permission_dictionary})
'''