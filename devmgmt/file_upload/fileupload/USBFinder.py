import os, inspect, json, re, shutil                                                                              #needed for os files
from django.conf import settings
from glob import glob                                                                           #Needed for directories
import subprocess                                                                               #Running lsusb
import getpass                                                                                  #used for getuser()
import time                                                                                     #temp fix; used to sleep
from stat import *                                                                              #imports stats like ST_SIZE
import threading                                                                                #Multithreading
from shutil import copy2                                                                        #Copies files

process = None
usb_direct = ''
staticFileLocRoot = settings.CONTENT_ROOT
data_folder = settings.USB_DIR
extns = settings.ACCEPTED_EXTNS


def get_usb_name():
    lsblk_out = subprocess.check_output("lsblk", shell=True)
    lsblk_list = lsblk_out.split('\n')
    media_dir = None
    for line in lsblk_list:
        if '/media/' in line:
            media_loc = line.index('/media/')
            media_dir = line[media_loc:].strip()
            print media_dir + ' is the media directory fren'
    global usb_direct
    usb_direct = media_dir
    return media_dir

def verify(device_mnt):
    blkid_out = subprocess.check_output("blkid", shell=True)
    blkid_list = blkid_out.split('\n')
    for line in blkid_list:
        if ("/dev/" + device_mnt) in line:
            return check_if_line_usb(line)

def check_if_line_usb(line):
    UUID_beg = line.index('UUID') + 5
    UUID_end = line.find('\"', UUID_beg+1)
    print str(UUID_end - UUID_beg)
    if UUID_end - UUID_beg == 10:
        return True
    return False

def transfer_file(file):
        print "file " + file + " staticFileLocRoot " + staticFileLocRoot
        #index=file.rfind('/')
        #file_name=file[index+1:]
        #file_name = file
        #print "file_name " + file_name + " staticFileLocRoot " + staticFileLocRoot
        global usb_direct
        shutil.copy2(usb_direct + '/' + data_folder + '/' + file, staticFileLocRoot)
        return 0

def attemptMount():
    lsblk_out = subprocess.check_output("lsblk", shell=True)
    lsblk_list = lsblk_out.split('\n')
    media_dir = None
    devmnt_regex = r'([s][d][a-zA-Z][0-9]+)'
    for line in lsblk_list:
        if '/media/' in line:
            media_loc = line.index('/media/')
            media_dir = line[media_loc:].strip()
            print 'Muy bien ' + media_dir
            print 'Bonjour a ' + media_dir
            try:
                media_mntpnt = re.findall(devmnt_regex, line)[0]
                print 'Media mountpoint is at ' + media_mntpnt
            except:
                return None
            is_needed = verify(media_mntpnt)
            if is_needed:
                break
    if media_dir is None:
        return None
    try:
        print media_dir + '/' + data_folder
        os.chdir(media_dir + '/' + data_folder)
    except:
        return None
    temps = [name for name in os.listdir(".")]
    print 'Temporary files are ' + str(temps)
    files = []
    for root, subfolders, usb_files in os.walk("."):
        for name in usb_files:
            if (not os.path.isdir(name)):
                if(name.endswith(tuple(extns))):
                    #if (not os.path.isdir(name)) and (name[-5:] == '.data' or name == 'content.json'):
                    files.append(os.path.join(root, name))
    return files

def main():
    #enableAutoMount()
    df = subprocess.check_output("lsusb", stderr=subprocess.STDOUT)                             #subprocess prints to stderr for some reason, making it think stdout is stderr
    oldDeviceList = df.split("\n")                                                              #gets list of previously connected usb devices
    while True:
        df = subprocess.check_output("lsusb", stderr=subprocess.STDOUT)                         #do it again
        newDeviceList = df.split('\n')                                                          #store in a NEW list

        if len(newDeviceList) > len(oldDeviceList):                                             #new usb device inserted!
            for line in newDeviceList:
                if line not in oldDeviceList:                                                   #this points to the newer device we have attached
                    IDAnchor = line.index("ID")
                    line = line[IDAnchor:]                                                      #slice off unwanted line info [such as bus information]
                    print ("You have attached " + line)                                         #debug purposes
                    time.sleep(3)                                                               #prevents python from attempting to access the files before the OS itself, might need to be increased
                    attemptMount()                                                              #attempt mounting the device

        if len(newDeviceList) < len(oldDeviceList):                                             #some USB device has been removed!
            for line in oldDeviceList:
                if line not in newDeviceList:
                    IDAnchor = line.index("ID")
                    line = line[IDAnchor:]
                    print ("You have removed " + line)
                    attemptRemoval()
        oldDeviceList = list(newDeviceList)                                                     #allows for the loop to function properly

if __name__ == '__main__':
    main()
