# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import subprocess
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
from .ssid_modifier import return_value
from django.conf import settings
from django.contrib.auth.decorators import login_required
# Create your views here.

cdn_scripts_dir = settings.CDN_SCRIPTS_DIR

ssid = return_value('ssid')

@login_required(login_url="/backadmin/")
def modify_ssid(request):
    global ssid, password
    result = None
    if request.method == 'POST':
        new_ssid = request.POST.get('ssid_name', '')
        ap_type = request.POST.get('apselect', '')
        command = cdn_scripts_dir + "modeChange.sh" + ' ' + ap_type + ' ' + new_ssid
        if ap_type == 'hostmode':
            password = request.POST.get('password', None)
            if len(password) >= 1:
                command += ' ' + password
        print 'We got ' + new_ssid
        t = subprocess.Popen(command, shell=True)
        print command
        t.communicate()[0]
        code = t.returncode
        if code != 0:
            return render(request, 'ssidmod/mod_ssid.html', {'result_text':'SSID modification failure!', 'ssid_name': ssid})
        return render(request, 'ssidmod/mod_ssid.html', {'result_text':'SSID modification is complete! Please refresh the page', 'ssid_name': new_ssid})
    return render(request, 'ssidmod/mod_ssid.html', {'result_text':None, 'ssid_name': ssid})

@login_required(login_url="/backadmin/")
def index(request):
    return HttpResponseRedirect('modify_ssid/')
