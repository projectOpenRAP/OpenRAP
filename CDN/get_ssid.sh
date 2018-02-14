#!/bin/bash

##Works only on device that has wlan device name as wlan0

iw dev wlan0 info | grep ssid | cut -f 2 -d ' '
