#!/bin/bash
#if [ $# -ne 2 ]; then
#    echo "Usage: request.sh <REST API endpoint> <telemetry gzip file>"
#    exit 1
#fi
set -xv

workingdir=$PWD

url="https://qa.ekstep.in/api/data/v3/telemetry"
telemetry_dir="/var/www/ekstep/telemetry"

#Check net connectivity
check_net_connectivity() {
    #1. ping google
    ping -q -c2 www.google.com 2>&1 >/dev/null
    if [ $? -eq 0 ]; then
        return
    fi
    #2. ping www.amazon.com
    ping -q -c2 www.amazon.com 2>&1 >/dev/null
    if [ $? -eq 0 ]; then
        return
    fi

    return -1
}


#Send 200 messages at max in every run
telemetry_send_batch() {
    cd $telemetry_dir
    count=1
    
    for gzfile in `ls -r`
    do
        echo "Sending telemetry file: $file"
        telemetry_send_file $file
        if [ $? -ne 0 ]; then
            echo "Telemetry send failed; retry later..."
            return -1
        fi

        # Send success, remove this file
        rm -f $file
        count=$((count+1))
        if [ $count -ge 200 ]; then
            break
        fi
    done
}


telemetry_send_file() {
    gzfile=$1
    
    tmp_out_file=/tmp/output_telemetry.json
    
    admin_key=""
    app_key=""
    app_secret=""
    mobile_key=""
    mobile_secret=""
    
    
    #post query to upload telemetry into ekstep server
    
    
    curl \
        -H 'Content-Type:application/json' \
        -H 'Content-Encoding:gzip' \
        -H 'Authorization:bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJwaWVudXQxIn0.6iJ5n_A3FKQjxouDkLdnm1lLSehYX4aDGfEDP5J_9is' \
        -X POST \
        -o $tmp_out_file \
        --data-binary  @$contentfile \
        $url
}

##################################################################333
#                     MAIN
##################################################################333

check_net_connectivity
if [ $? -ne 0 ]; then
    echo "No networking connectivity..."
    exit -1
fi

telemetry_send_batch()
