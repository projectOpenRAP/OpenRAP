#!/bin/bash
iw dev wlan0 station dump | grep Station | wc -l
