## Save fles

files_saved="
/opt/opencd/CDN/rootfs_overlay/etc/hostapd.conf
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

post_install()
{
echo "Running post install scripts"
restore_files
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


