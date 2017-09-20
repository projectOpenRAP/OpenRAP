#curl -X POST -H "Content-Type: application/octet-stream" --data-binary '@filename' http://127.0.0.1:5050/upload
#curl -X POST -H "Content-Type: application/json" -H "Content-Encoding: gzip" --data-binary '@filename' http://127.0.0.1:5050/api/telemetry/v1/telemetry
set -xv

#!/bin/bash
if [ $# -ne 1 ]; then
    echo "Usage: request.sh <content gzip file>"
    exit 1
fi

addr=qa.ekstep.in

contentfile=$1

tmp_out_file=/tmp/abc.json
out_file=output_telemetry_upload

admin_key=""
app_key=""
app_secret=""
mobile_key=""
mobile_secret=""


#post query to upload telemetry into ekstep server


curl \
    -v \
    -H 'Content-Type:application/json' \
    -H 'Content-Encoding:gzip' \
    -H 'Authorization:bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJwaWVudXQxIn0.6iJ5n_A3FKQjxouDkLdnm1lLSehYX4aDGfEDP5J_9is' \
    -X POST \
    -o $tmp_out_file \
    --data-binary  @$contentfile \
    https://${addr}/api/data/v3/telemetry
