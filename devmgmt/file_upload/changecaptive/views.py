from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
import subprocess, json, os

# Create your views here.
status_text = None
fail_text = None
def index(request):
	return render(request, 'changecaptive/change_captive.html', {'status_text': status_text, 'fail_text' : fail_text})


def remove_scripts(text):
	while text.find('<script>') != -1:
		script_location = text.find('<script>')
		script_end_location = text.find('</script>', script_location) + len('</script>')
		text = text[:script_location] + text[script_end_location:]
	return text

def write_to_file(filename, data):
	file_to_write = open('/opt/opencdn/rootfs_overlay/var/www/html/public/' + filename, 'wb+')
	if filename.endswith(".apk"):
		print len(data)
	file_to_write.write(data)
	file_to_write.close()
	if filename.endswith(".png"):
		command = 'avconv -i /opt/opencdn/rootfs_overlay/var/www/html/public/CaptivePortalLogo.png -vf scale=200:-1 /opt/opencdn/rootfs_overlay/var/www/html/public/images/CaptivePortalLogo.png -y'
		#command = 'mv /opt/opencdn/rootfs_overlay/var/www/html/public/CaptivePortalLogo.png /opt/opencdn/rootfs_overlay/var/www/html/public/images/CaptivePortalLogo.png'
		process = subprocess.Popen(command, shell=True)
		process.communicate()[0]
		result = process.returncode

'''
def captive_display(request):
       heading = ""
       text = ""
       heading = open('/var/www/ekstep/header.txt', 'r').read()
       text = open('/var/www/ekstep/text.txt', 'r').read()
       status_text = None
       fail_text = None
       try:
               logoexists = open('/var/www/ekstep/logo.png', 'rb')
               logo = True
       except IOError:
               logo = False
       try:
               apkexists = open('/var/www/ekstep/app.apk', 'rb')
               apk = True
       except IOError:
               apk = False
       return render(request, 'changecaptive/captiveportal.html', {'logo': logo, 'heading_text':heading, 'body_text': text, 'apk': apk, 'fail_text' : fail_text, 'status_text' : status_text})

'''
def change_logo(request):
	if request.method == 'POST':
		write_to_file('CaptivePortalLogo.png', request.body)
	return JsonResponse({'ok':'ok'})

def change_apk(request):
	if request.method == 'POST':
		write_to_file('app.apk', request.body)
	return JsonResponse({'ok':'ok'})

def return_text(request):
	json_file = open('/opt/opencdn/rootfs_overlay/var/www/html/text.json', 'r')
	return JsonResponse(json.load(json_file))

def change_data(request):
	if request.method == 'POST':
		header_data = request.POST.get('title')
		text_data = request.POST.get('description')
		if text_data is None:
			global status_text
			status_text = 'Please enter some text'
			return HttpResponseRedirect('../')
		print text_data
		data = dict()
		with open('/opt/opencdn/rootfs_overlay/var/www/html/text.json', 'r+') as json_file:
		#	print 'Currently ' + json_file.read()
			temp = json.load(json_file)
			data = temp['data']
			text_data = text_data.replace('\n', '<br>')
			text_data = text_data.rstrip()
			text_data = remove_scripts(text_data)
			if header_data is not None:
				data['head'] = header_data
			data['text'] = text_data
		with open('/var/www/html/text.json', 'w+') as json_file:
			json_file.write(json.dumps(temp))
		#write_to_file('text.txt', text_data)
		#if header_data is not None:
		#	write_to_file('header.txt', header_data)
		#edit_php_file(header_data, text_data)
	status_text = 'ok'
	return HttpResponseRedirect('../')
