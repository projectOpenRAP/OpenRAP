## Save fles

files_saved="
/opt/opencdn/rootfs_overlay/etc/hostapd/hostapd.conf
/opt/opencdn/rootfs_overlay/var/www/ekstep/config_json/config.json
"
save_files()
{
echo "Saving files"

for i in $files_saved
do
	 cp $i /tmp
done

}

restore_files()
{
	echo "Restoring files"

	for i in $files_saved
	do
		 mv /tmp/`echo $i | awk -F/ '{print $NF}'` $i
	done
}

install_aria2()
{
	echo "Installing aria2"
	dpkg -i /tmp/aria2_deb/*
}

remove_aria2_deb()
{
	echo "Cleaning aria2 deb files"
	rm -rf /tmp/aria2_deb
}

post_install()
{
echo "Running post install scripts"
restore_files

# Create a dir for searchdb (if not present)
mkdir -p /opt/searchEngine/bleveDbDir/
mkdir -p /home/admin/GoK/

#Set System time-zone
sudo timedatectl set-timezone Asia/Kolkata

# Install aria2 and clean up the deb files used
install_aria2
remove_aria2_deb

systemctl enable searchserver

systemctl enable appserver

systemctl enable syncthing

systemctl enable aria2

#There were two NTP clients on the system, ntp and systemd-timesyncd.Both were trying to set the date and were conflicting.The ntp is purged to resolve the conflict.
echo "Y" | apt purge ntp

#Optimize the system
rm -rf /var/log/daemon.log
ln -s /dev/null /var/log/daemon.log

rm -rf /var/log/dnsmasq.log
ln -s /dev/null /var/log/dnsmasq.log

rm -rf /var/log/syslog
ln -s /dev/null /var/log/syslog

update-rc.d dphys-swapfile remove

exit 0
}

pre_install()
{
echo "Running pre install scripts"
save_files

exit 0
}


if [ "$1" == "-post" ]
	then
	post_install
fi

if [ "$1" == "-pre" ]
		then
		pre_install
fi

echo "$0 <-post | -pre>"
