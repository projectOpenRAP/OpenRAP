import subprocess

##################################################
# Expected location is /etc/hostapd/hostapd.conf #			    
##################################################
wifi_file_name = '/etc/hostapd/hostapd.conf'

ssid_dict = {'ssid':'', 'password':''}
def return_value(parameter):
	refresh_dict()
	return ssid_dict[parameter]

def refresh_dict():
	global wifi_file_name
	wifi_file = open(wifi_file_name, 'r')
	for line in wifi_file:
		if line[:4] == 'ssid':
			ssid_dict['ssid'] = line[5:]

def change_manually(parameter, name_string):
	global wifi_file_name
	ssid_line = ''
	wifi_file = open(wifi_file_name, 'r')
	wifi_file_2 = open(wifi_file_name + '_backup', 'w')
	for line in wifi_file:
		if line[:len(parameter)] != parameter:
			wifi_file_2.write(line)
			continue
		else:
			print line
			print '[*]The current ' + parameter + ' is ' + line [len(parameter)+1:]
			new_ssid_line = line[:len(parameter) + 1] + name_string + '\n'
			print '[*]The new ' + parameter + ' is ' + new_ssid_line[len(parameter)+1:]
			wifi_file_2.write(new_ssid_line)
	command = "mv " + wifi_file_name + '_backup' + ' ' + wifi_file_name
	opened_process = subprocess.Popen(command, shell=True)
	opened_process.communicate()[0]
	return opened_process.returncode #Returns 0 if successful, 1/-1 if failure

def main():
	changer = lambda x, y : change_manually(x, y)
	#Modify later to parse request.POST to get the parameter to be changed
	param_change = raw_input('[+]Enter parameter to change [ssid, wpa_passphrase]: ')
	new_val = raw_input('[+]Enter new value for ' + param_change + ': ')
	result = changer(param_change, new_val)
	if result == 0:
		print '[+]Success'
	else:
		print '[-]Failure'

if __name__ == '__main__':
	main()
