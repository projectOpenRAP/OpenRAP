#!/bin/bash
# Script to move device from AP mode to client mode and vice-a-versa


### Copy interfaces file for static config

static () {

cat << EOF > /etc/network/interfaces
auto lo
iface lo inet loopback

#auto eth0
allow-hotplug eth0
iface eth0 inet dhcp


auto wlan0
allow-hotplug wlan0
iface wlan0 inet static
address 192.168.0.1
netmask 255.255.255.0
EOF

}

## Copy interfaces file for dhcp config

dynamic_psk () {

cat << EOF > /etc/network/interfaces
auto lo
iface lo inet loopback

#auto eth0
allow-hotplug eth0
iface eth0 inet dhcp

auto wlan0
allow-hotplug wlan0
iface wlan0 inet dhcp
    wpa-psk "$PSK"
    wpa-ssid "$SSID"
EOF

}


dynamic_none () {

cat << EOF > /etc/network/interfaces
auto lo
iface lo inet loopback

#auto eth0
allow-hotplug eth0
iface eth0 inet dhcp

auto wlan0
allow-hotplug wlan0
iface wlan0 inet dhcp
    wpa-ssid "$SSID"
    wpa-key-mgmt NONE
EOF


}

hostapd_conf () {
    cat << EOF > /etc/hostapd/hostapd.conf
interface=wlan0
ssid=$SSID
hw_mode=g
channel=2
ieee80211n=1
auth_algs=1

EOF
}

help () {
    echo ""
    echo "$0 hostmode <ssid> [<password>]|apmode <ssid>"
    echo ""

    exit -1

}

stop_apmode()
{

#stop few services
        /usr/sbin/service hostapd stop #if called second time, just to change the SSID
        /usr/sbin/service dnsmasq stop
        /usr/sbin/service dhcpcd stop
        /usr/sbin/service wpa_supplicant stop

#Kill manually triggered wpa_supplicant
        killall -15 wpa_supplicant # Stop any manually triggered process
}

start_apmode()
{

# restart networking
        /usr/sbin/service networking restart

# restart other services         
        /usr/sbin/service hostapd start
        /usr/sbin/service dnsmasq start

# Enable services 
        /bin/systemctl enable hostapd 
        /bin/systemctl enable dnsmasq

}


###Parse the commands

if [ "$1" == "apmode_restore" ] # hidden option to start AP mode with a file
    then

    stop_apmode
    #update /etc/network/interfaces
    static

    start_apmode

    exit 0
fi

if [ $# -lt 1 ]
        then
        help 
fi

if [ "$1" == "hostmode" ]
        then
## move to hostmode
## Stop hostapd, dhcpserver, dns server and dhcpclient (cleanup)

	stop_apmode

        SSID=$2 
        if [ $# -eq 3 ]
            then
            PSK=$3
            dynamic_psk
            else
            dynamic_none
        fi

    sync; sync; sync

    sleep 2
    ifdown wlan0
    sleep 2
    ifup wlan0
    
    echo Done...


exit 0

    
    ##Let us verify if connection was succefull
    STATUS=`cat /sys/class/net/wlan0/operstate`

    if [ "$STATUS" == "up" ]
    then
    ### put the /etc/networking/interfaces file back, so that across reload, the box 
    ### come back as AP
    static 
        exit 0
    fi

    ##status not ok, we will start apmode again

    $0  apmode_restore
    exit 0
    

fi

if [ "$1" == "apmode" ]
    then

    stop_apmode
    #update /etc/network/interfaces
    static
    #update hostapd.conf
    SSID=$2
    hostapd_conf
    start_apmode

exit 0
fi

help
