# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponseRedirect
from django.views.generic.edit import DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.decorators import login_required
# Create your views here.

message = None

@login_required(login_url="/backadmin/")
def index(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            #username = form.cleaned_data.get('username')
            #raw_password = form.cleaned_data.get('password1')
            #userx = authenticate(username=username, password=raw_password)
        return HttpResponseRedirect('/createuser/new/')
    else:
        users = [user for user in User.objects.all() if not user.is_superuser]
        form = UserCreationForm()
        return render(request, 'createuser/user_create.html', {'form' : form, 'users' : users})

@login_required(login_url="/backadmin/")
def delete_user(request):
    users = [user for user in User.objects.all() if not user.is_superuser]
    return render(request, 'createuser/user_delete.html', {'users': users})

@login_required(login_url="/backadmin/")
def delete(request):
    if request.method == 'POST':
        primary = int(request.POST.get("delete_me", ""))
        user_to_destroy = User.objects.get(pk=primary)
        user_to_destroy.delete()
    return HttpResponseRedirect('/createuser/new/')
