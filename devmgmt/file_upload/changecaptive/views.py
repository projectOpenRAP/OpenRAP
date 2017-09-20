from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
import subprocess

# Create your views here.
status_text = None
fail_text = None
def index(request):
	return render(request, 'changecaptive/change_captive.html', {'status_text': status_text, 'fail_text' : fail_text})

def edit_php_file(header, text):
	php_file = open('changecaptive/templates/changecaptive/index.php', 'r+')
	new_php_file = open('changecaptive/templates/changecaptive/index.php2', 'w+')
	lines = [line for line in php_file]
	i = 0
	for i in range (0, len(lines)):
		new_php_file.write(lines[i])
		if '<!--EDIT BELOW HEADING-->' in lines[i]:
			break
	new_heading_line = '<h2>' + header + '</h2>\n'
	new_php_file.write(new_heading_line)
	j = i+2
	for j in range (i+2, len(lines)):
		new_php_file.write(lines[j])
		if '//EDIT_BELOW_THIS_LINE' in lines[j]:
			break
	line_to_edit = lines[j+1]
	index_to_begin = line_to_edit.index('var text = ') + len('var text = ')
	new_line = line_to_edit[:index_to_begin]
	modded_part_string = '`' + text + '`;\n'
	new_line += modded_part_string
	#GO TO NEXT LINE THAT CONTAINS DOCUMENT.WRITE
	for i in range(j+2, len(lines)):
		if 'document.write' in lines[i]:
			new_php_file.write(lines[i])
			break
	for j in range(i+1, len(lines)):
		new_php_file.write(lines[j])
	command2 = 'mv -f changecaptive/templates/changecaptive/index.php2 changecaptive/templates/changecaptive/index.php'
	process2 = subprocess.Popen(command2, shell=True)
	process2.communicate()[0]
	result = process2.returncode

def remove_scripts(text):
	while text.find('<script>') != -1:
		script_location = text.find('<script>')
		script_end_location = text.find('</script>', script_location) + len('</script>')
		text = text[:script_location] + text[script_end_location:]
	return text

def write_to_file(filename, data):
	file_to_write = open('/var/www/ekstep/' + filename, 'wb+')
	if filename.endswith(".apk"):
		print len(data)
	file_to_write.write(data)
	file_to_write.close()
	if filename.endswith(".png"):
		command = 'ffmpeg -i /var/www/ekstep/logo.png -vf scale=90:31 /var/www/ekstep/logo2.png -y'
		process = subprocess.Popen(command, shell=True)
		process.communicate()[0]
		result = process.returncode
		if result == 0:
			command2 = 'mv -f /var/www/ekstep/logo2.png /var/www/ekstep/logo.png'
			process2 = subprocess.Popen(command2, shell=True)
			process2.communicate()[0]
			result = process2.returncode

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

def change_logo(request):
	if request.method == 'POST':
		write_to_file('logo.png', request.body)
	return JsonResponse({'ok':'ok'})

def change_apk(request):
	if request.method == 'POST':
		write_to_file('app.apk', request.body)
	return JsonResponse({'ok':'ok'})

def change_data(request):
	if request.method == 'POST':	
		header_data = request.POST.get('title')
		text_data = request.POST.get('description')
		if text_data is None:
			global status_text
			status_text = 'Please enter some text'
			return HttpResponseRedirect('../')
		print text_data
		text_data = text_data.replace('\n', '<br>')
		text_data = text_data.rstrip()
		text_data = remove_scripts(text_data)
		write_to_file('text.txt', text_data)
		if header_data is not None:
			write_to_file('header.txt', header_data)
		#edit_php_file(header_data, text_data)
	status_text = 'ok'
	return HttpResponseRedirect('../')
