#!/bin/bash
########################################################
##############Open CDN upgrade script###################
########################################################

##############Quick design##############################
# a. Packaging is assumed to be tgz
# b. All the opencdn files are stored in /opt/opecdn-<version>
# c. A soft link /opt/opencdn to current actve version
# d. All other files are soft link to /opt/opencdn/*
#    for example, /etc/dnsmasq.conf is soft link to 
#    /opt/opencdn/etc/dnsmasq.conf
# e. After successful upgrade, old version is retained in soft link /opt/opencdn.old
# Upgrade steps   
# a. Extract the version number from the give tgz package
# b. Check if current version is lower than to be upfraded
#    version <package>/cdn/version.txt
# c. If no force option, reject upgrade and exit
# d. If version is ok, extract the tar package to 
#    /opt/opencdn-<version>
# e. Change the link of /opt/opencdn to new version
# f. Verify of things are fine, if ok, save old version's soflink to /opt/opencdn.old
# g. If verification fails, delete new version and restore
#    the link
# h. The script <package>/CDN/preinstall,sh is run before installation
# i. The script <package>/CDN/postinstall.sh is run after installation

# BUGS:
# a. old version is not deleted from /mount/path/opt/opencdn-x.x.x when installed on a image
# b. When installed on a image file, version verification do not work correctly, given package is 
#    always installed.
# c. pre-install and post install do not work as expected on img


#install paths
TARGET=/opt
INSTALL_DIR=$TARGET


# package related paths
CDNROOT=opencdn 
VERSION=$CDNROOT/CDN/version.txt
PREPOSTFILE=$CDNROOT/CDN/postpreinstall.sh

POSTINSTALL="$CDNROOT/CDN/postpreinstall.sh -post"
PREINSTALL="$CDNROOT/CDN/postpreinstall.sh -pre"

ROOTFS_OVERLAY=$CDNROOT/rootfs_overlay

LOG_DIR=/tmp/edgecdn
LOG_FILE=$LOG_DIR/upgrade.log


# Variables for adding content to a img file
BLOCK_SIZE=512
START=94208


# working paths
TMPDIR=/tmp/opencdn-tmp
MOUNT_PATH=/

CUR_DIR=$PWD

IMG=0

logmsg() {
    #echo $@ | tee $LOG_FILE
    echo $@
    echo $@ >> $LOG_FILE
}

run_cmd() {
    logmsg $@
    $@ >> $LOG_FILE 2>&1
}


cleanup()
{

# remove tmp dir
rm -rf $MOUNT_PATH$TMPDIR

# remove downloaded file
rm -f $clean_up_downloaded

if [ $IMG -eq 1 ]
then
	umount $MOUNT_PATH
	
	if [ "$MOUNT_PATH" == "/" ]
	then
		echo "Something worong, never mind, I will not screwing up"
	else
		rm -rf $MOUNT_PATH
	fi
fi

}

check_version() {
logmsg "Verifying versioning of the package..."
NVER=`awk -F- '{print $1}' $MOUNT_PATH$TMPDIR/$VERSION`
OVER=`awk -F- '{print $1}' $MOUNT_PATH$TARGET/$VERSION`

echo "debug- NVER=$NVER OVER=$OVER"

if [ "$NVER" == "$OVER" ]
	then
	logmsg "Current and new version are same, upgrade failed "
	cleanup
	exit -2
fi


toTest="$NVER
$OVER"

if [ "$toTest" == "$(sort --version-sort <<< "$toTest")" ]
        then
        logmsg "Downgrade to $NVER ignored... current version: $OVER !!"
        cleanup
        exit -2

else
        logmsg "Version check passed, to upgrade from $OVER to $NVER"

fi


}

verify ()
{

#service hostapd restart
#service dnsmasq restart
#service apiserver restart

logmsg "Verifying installation..."

# If failed set below to 1
verify_failed=0

}

help ()
{
	echo
	echo "$0 <uri://package.tgz> [imageFile]"
	echo "To run as root or with root previlage"
	echo "Exit values"
	echo " 			-1 incorrect arguments"
	echo "			-2 version check failed"
	echo "			-3 verification failed"
	exit -1
}


########################################################
#                MAIN
########################################################

if [ $# -lt 1 ];
then
	help
fi

id | grep -q "uid=0(root)"

if [ $? -eq 1 ]
	then
	help
fi

# Make sure log directory is present
# No run_cmd for this :)
mkdir -p $LOG_DIR


uri=`echo $1 | awk -F:// '{print $1}'`
urp=`echo $1 | awk -F:// '{print $2}'`

case $uri in
	"file") 
	pkg_tgz=$urp
	;;

	"http")
	wget -v -nd $1
	pkg_tgz=`echo $1 | awk -F/ '{print $NF}'`
	clean_up_downloaded=$pkg_tgz
	;;

	"ftp")
	wget -v -nd $1
	pkg_tgz=`echo $1 | awk -F/ '{print $NF}'`
	clean_up_downloaded=$pkg_tgz
	;;

	*)
	echo "unknow uri"
	help
	;;

esac


logmsg "Starting upgrade process..."


if [ $# -eq 2 ] #Package to be installed in a img
then
	img_file=$2
	IMG=1 ## to be copied to image, set it true

	OFFSET=`expr $START '*' $BLOCK_SIZE`

	MOUNT_PATH=/tmp/mount/
	run_cmd mkdir -p $MOUNT_PATH
	#mount -o loop,offset=$OFFSET $2 $MOUNT_PATH
	run_cmd "mount -o loop,offset=$OFFSET $img_file $MOUNT_PATH"
	INSTALL_DIR=$MOUNT_PATH$TARGET
	
fi




run_cmd mkdir -p $MOUNT_PATH$TMPDIR

##First get version
tar -C $MOUNT_PATH$TMPDIR  -xvzf $pkg_tgz $VERSION 
check_version 


## Execute the pre-install
tar -C $MOUNT_PATH$TMPDIR -xvzf $pkg_tgz $PREPOSTFILE 
logmsg "Running preinstall scripts..."
bash $MOUNT_PATH$TMPDIR/$PREINSTALL
## TODO error handling

## extract the files and move to versioned directory
run_cmd tar -C $MOUNT_PATH$TMPDIR -xzf $pkg_tgz 
run_cmd mv $MOUNT_PATH$TMPDIR/$CDNROOT $MOUNT_PATH$TARGET/$CDNROOT-$NVER


logmsg "Adjusting the /opt/opencdn links..."
cd $INSTALL_DIR

## 
## backup the existing softlink to opencdn.old and create a new softlink 
## If installation succesful, opencdn.old2 will be deleted as part of cleanup process
##
run_cmd mv $CDNROOT $CDNROOT.previous
run_cmd ln -s $CDNROOT-$NVER $CDNROOT
cd $CUR_DIR

## 
## Now link all the files 
## Since 'cp -s' needs absolute path, we need a trick when installing into image file
## 

if [ $IMG -eq 1 ]
then
	logmsg "Installing into image file..."
	#run_cmd cp -r $MOUNT_PATH$TARGET/$CDNROOT-$NVER $TARGET
	run_cmd  mv $TARGET/$CDNROOT $TARGET/$CDNROOT.backup
	run_cmd ln -s $MOUNT_PATH$TARGET/$CDNROOT-$NVER $TARGET/$CDNROOT
	run_cmd "cp -frs $TARGET/$ROOTFS_OVERLAY/* /$MOUNT_PATH/"
	run_cmd rm $TARGET/$CDNROOT
else
    run_cmd "cp -frs $TARGET/$ROOTFS_OVERLAY/* /$MOUNT_PATH/"

fi

### Now verify 

verify


if [ $verify_failed -eq 1 ]
then
	logmsg "Installation verification failed, rolling back..." 
	run_cmd rm $MOUNT_PATH$TARGET/$CDNROOT
	run_cmd rm -rf $MOUNT_PATH$TARGET/$CDNROOT-$NVER
	## Note no mount path for ln command, since we do not want mount path
	run_cmd mv $MOUNT_PATH$TARGET/$CDNROOT.previous $TARGET/$CDNROOT
	cleanup
	exit -3
fi

#Verify was sucessfull clean up remaining stuff, after post install

## Run post install
echo "Running postinstall scripts"
bash $MOUNT_PATH$TARGET/$POSTINSTALL

# Remove the opencdn.old link and directory if present
logmsg "Installation successful, cleaning up..."

cd $INSTALL_DIR
del_dir=`readlink $CDNROOT.old`
logmsg "Removing $del_dir ..."
run_cmd rm -rf ./$del_dir
run_cmd rm $CDNROOT.old

old_dir=`readlink $CDNROOT.previous`
run_cmd ln -s  $old_dir $CDNROOT.old
run_cmd rm $CDNROOT.previous
cd $CUR_DIR

cleanup
