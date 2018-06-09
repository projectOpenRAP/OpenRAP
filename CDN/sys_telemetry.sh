#!/bin/bash


#### Script to collect system telemetry
#### collects, last up time, internet status and number of clients connected
#### to the AP

POLL_SWEEP_TIME=15 ##Every 15 seconds
INET_STATUS=0 ## not connected currently, 1 would mean connected
CLIENT_NUMBER=0 ## default start with zero clients

init () {
## Send device up
echo curl http://127.0.0.1/api/v1/device_up
## Send Inet is not connected and devices are zero
echo curl http://127.0.0.1/api/v1/inet_status_down
echo curl http://127.0.0.1/api/v1/client_number?=0
}

check_inet () {
        nc -zw 1 8.8.8.8 53
        ret=$?
        echo Internet status is $ret
        if [ $ret -ne 0 ]
                then
                CURRENT_INET_STATUS=0
                else
                CURRENT_INET_STATUS=1
        fi

        if [ $CURRENT_INET_STATUS -ne $INET_STATUS ]
                then
                echo curl http://127.0.0.1/api/v1/inet_status_up?=$INET_STATUS
                INET_STATUS=$CURRENT_INET_STATUS
        fi

}

get_wlan_clients () {

        CURRENT_CLIENT_NUMBER=`iw dev wlan0 station dump | grep Station | wc -l`
        echo current client number $CURRENT_CLIENT_NUMBER

        if [ $CURRENT_CLIENT_NUMBER -ne $CLIENT_NUMBER ]
                then
                echo curl http://127.0.0.1/api/v1/client_number?=$CURRENT_CLIENT_NUMBER
                CLIENT_NUMBER=$CURRENT_CLIENT_NUMBER
        fi

}

##main

init

while [ 1 ]
do
        check_inet
        get_wlan_clients
        sleep $POLL_SWEEP_TIME
done
