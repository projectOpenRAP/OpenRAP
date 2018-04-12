#!/bin/bash
logdir=/tmp/

#/bin/udisksctl

usb_logfile=$logdir/usb_handler.log

#Make sure directory structure exists
#mkdir -p $logdir > /dev/null 2>&1

sleep 2
echo "$(date): $ACTION: Calling usb_handler for $@" >> $usb_logfile

if [ $# != 1 ]; then
   echo "$(date): $ACTION: No device mentioned to handle...." >> $usb_logfile
   exit 0;
fi

mount_dir=/media/$1

if [ "X_$ACTION" = "X_add" ]; then
   echo "$(date): $ACTION: device $1 ....">> $usb_logfile
   mkdir -p $mount_dir > /dev/null 2>&1
   #echo "mount -w /dev/$1 $mount_dir" >> $usb_logfile
   #/usr/bin/udisksctl mount -b /dev/$1
   /bin/mount -w -o utf8 /dev/$1 $mount_dir >> $usb_logfile
   status=$?
   if [ "$status" -ne "0" ]; then
       echo "failure($status): mount -w /dev/$1 $mount_dir" >> $usb_logfile
   else
       echo "success($status): mount -w /dev/$1 $mount_dir" >> $usb_logfile
   fi
   #/usr/bin/pmount --umask 000 --noatime --charset utf8 $1 $1

elif [ "X_$ACTION" = "X_remove" ]; then
   echo "$(date): $ACTION: device $1 ....">> $usb_logfile
   #/usr/bin/pumount $1
   #/usr/bin/udisksctl unmount -b /dev/$1
   /bin/umount $mount_dir
   status=$?
   if [ "$status" -ne "0" ]; then
       echo "failure($status): umount $mount_dir" >> $usb_logfile
   else
       echo "success($status): umount $mount_dir" >> $usb_logfile
   fi
   rmdir -r $mount_dir > /dev/null 2>&1
fi
sleep 2
