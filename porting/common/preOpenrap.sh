########################## Porting steps ###########################
# Step 0. Assume that ubuntu 17.10 or newer server version is installed

# Step 1. Upgrade the packages
echo
echo "Calling apt-get update.. hit any key for ok"
echo
read

sudo apt-get -y update
    #sudo apt-get -y upgrade
# Step 2. Make sure that Ethernet interface name is eth0
    # Usually the interface name translates to "enp1s0" at boot time. This remapping can be disabled by modifying the grub files as
    # ! This has been taken care by editing the "grub" file 
    # open grub and edit the line (GRUB_CMDLINE_LINUX="") as (GRUB_CMDLINE_LINUX="net.ifnames=0 biosdevname=0")
    # Upgrade the grub file :
    # sudo grub-mkconfig -o /boot/grub/grub.cfg 

# Step 3. Install the required packages
    # Installation using exixting apt-get packages
echo
echo "Installing hostapd, dnsmasq,ifupdown,nginx,wirelsss-tools.. hit any key for ok"
echo
read
sudo apt-get install -y hostapd dnsmasq ifupdown nginx wireless-tools
    # Installation which requires manual intervenstion
echo
echo "Installing mysql.. hit any key for ok"
echo
read
sudo apt-get install -y mysql-server    
    # Installation of latest releases of Nodejs and npm
echo
echo "Installing nodejs.. hit any key for ok"
echo
read
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - 
sudo apt-get install -y nodejs 

# Step 4. nginx configuration
    # Remove the default web-server file:
echo
echo "Some cleanup.... hit any key for ok"
echo
read
sudo rm /etc/nginx/sites-enabled/default
    # Extract the upgrade.sh file from the .tgz file
echo
echo "installing openrap-0.2.2-ES.tgz .... hit any key for ok"
echo
read
sudo tar -x -f openrap-0.2.2-ES.tgz opencdn/CDN/upgrade.sh --strip-components=2
    # Change the mode of ./upgrade.sh to executable and run it
sudo chmod +x upgrade.sh
sudo ./upgrade.sh file:///home/admin/openrap-0.2.2-ES.tgz


