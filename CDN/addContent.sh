#!/bin/bash

#### Scripto add content(teach kits for example) to flash


start=128
blocksize=512 

#To update
datafile_path=/var/www/HMLT/docs  
database_path=/var/www/api_server/


mount_path=/tmp/mount

help ()
{
	echo $0 "</absolute/path/to/data/files> <databasefile> <image_file> "
	echo "Will add the files in <path/to/data/files> to <img_file> and will also update the databasefile "
	exit -1
}


if [ $# -lt 3 ]
	then
	help
fi

echo "Now coping all the contents in $1/ to $3 and will update database file $2"
echo "Hit any key to continue.."

read

offset=`expr $start '*' $blocksize`

mkdir -p $mount_path

## First let us mount the img file..
mount -o loop,offset=$offset $3 $mount_path


## cp the contents
cp  $1/* $mount_path/$1

## copy the database files

cp $2 $mount_path/$database_path/

umount $mount_path

rmdir $mount_path

