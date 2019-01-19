#!/bin/sh
status="false"
errcode=1
for i in 1 2 3; do
    ping -q -c 1 -w 2 8.8.8.8
    if [ $? -eq 0 ]; then
        #connected
        status="true"
        errcode=0
        break
    fi
done
echo $status
return $errcode