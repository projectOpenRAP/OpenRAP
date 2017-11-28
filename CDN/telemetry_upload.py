#!/usr/bin/env python
""" Uploaded telemetry to cloud server in regular interval """

import sys, os, subprocess, shutil
import json
import jwt
import logging
import random
import requests
import string
#from secrets import token_urlsafe
import time, threading


#############
#Global configurations for build
regURL = 'https://qa.ekstep.in/api/api-manager/v1/consumer/cdn_device/credential/register'
tmURL = 'https://qa.ekstep.in/api/data/v3/telemetry'
app_jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJvcGVucmFwLXYxIn0.BlKcxXLMXDe5wGSLIyN7DV6B808Fmi87-OJRHGS0NCE'

JWT_ALGORITHM = "HS256"

logfile="telemetry_upload.log"
device_key=""
device_secret=""
tm_jwt=""

tmDir = "/var/www/ekstep/telemetry"

#################
class BreakoutException(Exception):
    """ Custom expection """
    pass

#################
def logging_init():
    global log
    global logfd
    log = logging.getLogger('TELEMETRY')
    log.setLevel(logging.INFO)

    # create formatter and add it to the handlers
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    build_logfilename = "/tmp/" + logfile

    #Needed to log output of subprocess.Popen
    logfd = open(build_logfilename, "a")

    # create file handler which logs even debug messages
    fh = logging.FileHandler(build_logfilename)
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(formatter)
    log.addHandler(fh)
    
    # create console handler with a higher log level
    ch = logging.StreamHandler()
    ch.setLevel(logging.ERROR)
    ch.setFormatter(formatter)
    log.addHandler(ch)
    # Keep a global reference of the logger
    log.info("START:  Logfile: " + build_logfilename)


def run_cmd(cmd):
    global logfd 
    print(logfd, "executing: %s" % cmd)
    p = subprocess.Popen(cmd, shell=True, stdout=logfd, stderr=subprocess.PIPE)
    (result, error) = p.communicate()
    if p.returncode != 0:
        print(error)
        #sys.exit(p.returncode)
    return (p.returncode)

def jwt_generate(key, secret):
    payload = { "iss": key }
    header = { "alg": "HS256", "typ": "JWT"}
    token = jwt.encode(payload, secret, algorithm=JWT_ALGORITHM, headers=header)
    return token 

def check_netconnectivity():
    cmd = "ping -c 2 -W 5 8.8.8.8"
    status = run_cmd(cmd)
    if status == 0:
        return True
    # Ping not sucessful, just check with another server
    cmd = "ping -c 2 -W 5 www.amazon.com"
    status = run_cmd(cmd)
    if status == 0:
        return True
    return False

def token_generate():
    #generate a unique device_key
    global device_key, device_secret, tm_jwt

    #device_key = token_urlsafe(16)
    device_key = ''.join(random.choice(string.ascii_letters + string.digits) for x in range(16))

    # Construct a POST request to get app key and secret from reqURL
    payload = {
            "id": "ekstep.cdn.pinut",
            "ver": "2.0",
            "request": { "key": device_key}
            }

    auth_text = "bearer " + app_jwt
    headers = {'Content-Type': 'application/json', 'Authorization': auth_text}

    r  = requests.post(url=regURL, data=json.dumps(payload), headers=headers)
    if r.status_code // 100 != 2:
        log.error("Server error: Not received SECRET for device_key: " + device_key)
        sys.exit(1)

    device_key = r.json().get('result').get('key')
    device_secret = r.json().get('result').get('secret')
    #generate the telemetry jwt from app key and secret
    tm_jwt = jwt_generate(device_key, device_secret).decode()
    log.info("Device_key[%s] Device_secret[%s] JWT_token[%s]\n" %(device_key, device_secret, tm_jwt))


def telemetry_upload_file(filename, jwt, endpoint=tmURL):
    # Construct a POST request to upload telemetry
    auth_text = "bearer " + jwt
    headers = {'Content-Type': 'application/json', 'Content-Encoding': 'gzip', 'Authorization': auth_text}

    fin = open(filename, 'rb')
    try:
          r  = requests.post(url=endpoint, data=fin, headers=headers)
          print(r.text)
    finally:
            fin.close()
    # Parse the response json

    es_resp_status = r.json().get('params').get('status')
    es_resp_err = r.json().get('params').get('err')
    es_resp_errmsg = r.json().get('params').get('errmsg')
    return (r.status_code, es_resp_status, es_resp_err, es_resp_errmsg)


# Generate log sparingly
log_optimization_limit = 25
log_current_value = 0 

def telemetry_upload_dir():
    #
    # Check if telemetry file avalable to sync
    # If not, just return
    #
    global tmDir
    tm_dir = tmDir

    try:
        try:
            os.chdir(tm_dir)
        except:
            err_msg = "Directory read error:  " + tm_dir
            raise BreakoutException

        tmfile_list = os.listdir(tm_dir)
        #tmfile_list = sorted(os.listdir(tm_dir),key=os.path.getctime);
        if not tmfile_list:
            err_msg = "No file in " + tm_dir + " to upload..."
            raise BreakoutException

        #log.info(' '.join(str(x) for x in tmfile_list))
        #
        # We have some files to upload; check net connectivity now
        # If not connected, just return
        #
        netstatus = check_netconnectivity()
        if not netstatus:
            err_msg = "Not connected to network..."
            raise BreakoutException
        else:
            log.info("Connected to network...")
   
        tmfile_timesorted_list = sorted(tmfile_list, key=os.path.getmtime)
        #log.info(' '.join(str(x) for x in tmfile_list))

        #
        # Upload the first file with existing credential
        # If we get unauthorized/rate limited error
        # Handle that
        #
        ratelimit_count = 100
        for filename in tmfile_timesorted_list:
            status, es_resp_status, es_resp_err, es_resp_errmsg = telemetry_upload_file(filename, tm_jwt, tmURL)
            if es_resp_status == "successful" or es_resp_err == "INVALID_DATA_ERROR":
                log.info("telemetry upload(%s) status: %s %s" % 
                        (filename, es_resp_status, es_resp_errmsg))
                # delete this file
                os.remove(filename)
            else:
                log.info("telemetry upload(%s) status: %d es_status: %s es_err: %s es_errmsg: %s" %
                        (filename, status, es_resp_status, es_resp_err, es_resp_errmsg))
                # TODO: If failed due to token expiry, we need to regenerate the token
                # For now, we are generating the token on every reboot anyway
                break

            # Ensure we are not rate limited by server
            if ratelimit_count < 1:
                break
            else:
                ratelimit_count = ratelimit_count - 1
    except:
        # Don't flood with logs from timer
        global log_optimization_limit, log_current_value
        log_current_value  = log_current_value + 1

        if log_current_value == 1:
            log.error(err_msg)
        elif log_current_value >= log_optimization_limit:
            log_current_value  = 0
            
    # The below line required for next timer fire
    threading.Timer(240, telemetry_upload_dir).start()

##########################################
#           MAIN
##########################################
if __name__ == '__main__':
    logging_init()
    token_generate()
    telemetry_upload_dir()
