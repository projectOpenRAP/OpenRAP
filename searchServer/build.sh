#!/bin/bash
# NOTE: Run this scripts from inside go env (from soft link)
# Assume that apiserver is softlink to build/go/src/bitbucket.org/teamopencdn/apiserver
# cd build/go/src/bitbucket.org/teamopencdn
# And ./build.sh pc

if [ $# -ne 1 ]; then
    echo "$0 <arm|pc>"
    exit 0
fi

export GOPATH=$PWD/../../../../..
export GOBIN=$GOPATH/bin
export PATH=/usr/local/go/bin:$GOBIN:$PATH

arch=$1

exe_name=searchServer
echo "GOPATH=$GOPATH"


if [ $arch == "arm" ]; then
    env CGO_ENABLED=0 GOOS=linux GOARCH=arm go build -o $exe_name
else
    env CGO_ENABLED=0 go build -o $exe_name
fi

