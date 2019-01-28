#!/usr/bin/env python3
import sys, os, subprocess, argparse, shutil, urllib
import logging
import json

#############
#Global configurations for build
base_dir = os.environ['PWD'] + "/"
build_dir = base_dir + 'build/'

rootfs_dir = base_dir + 'rootfs_overlay'
cdn_dir    = base_dir + 'CDN'
ver_file   = cdn_dir + 'version.txt'

build_logfile = "buildimage.log"

log = logging.getLogger('ORAP')

# GO path setting
GOARCH='arm'
gopath = base_dir + 'build/go/'
apiserver_parent_dir = gopath + "src/github.com/projectOpenRAP/OpenRAP/"
syncthing_dir = gopath + "src/github.com/syncthing/syncthing/"

# Device management server
dmserver_dir = base_dir + 'devmgmtV2'
dbsdk_dir = base_dir + 'dbsdk'
dbsdk2_dir = base_dir + 'dbsdk2'
filesdk_dir = base_dir + 'filesdk'
searchsdk_dir = base_dir + 'searchsdk'
appServer_dir = base_dir + 'appServer'
telemetrysdk_dir = base_dir + 'telemetrysdk'
#############

def version_get(vf):
    with open(vf) as f:
        line = f.read().splitlines()
        #line = f.readline()
        word = line[0]
    return word


def file_version_update(vf, version):
    with open(vf, "w") as f:
        f.write(version)


def hostname_get(profile):
    hostname = "openRAP"
    return hostname

def file_hostname_update(vf, hostname):
    with open(vf, "w") as f:
        f.write(hostname)

def file_hosts_update(vf, hostname):
    with open(vf, "w") as f:
        line1 = "127.0.0.1    localhost"
        line2 = "127.0.1.1    " + hostname
        f.write("%s\n%s\n" % (line1, line2))

def file_hostapdconf_update(vf, hostname):
    lines = []
    with open(vf, "r") as f:
        for line in f:
            if not line.startswith("ssid"):
                lines.append(line)

    ssid = "ssid=" + hostname + "\n"
    with open(vf, "w") as f:
        f.write(ssid)
        f.writelines(lines)


def file_profilejson_update(vf, profile):
    with open(vf, "r") as f:
        json_data = json.load(f)
        json_data['active_profile'] = profile

    with open(vf, "w") as f:
        f.write(json.dumps(json_data))


def golang_init():
    global log
    #Make sure go is installed
    # Set the GOPATH, GOBIN env
    os.environ['GOPATH'] = gopath
    os.environ['GOBIN'] = gopath + "bin"
    os.environ['PATH'] = os.environ['GOBIN'] + ":" + os.environ['PATH']

    # Check if go compiler is installed
    if shutil.which('go') is None:
        log.error("Please install GO compiler from: https://golang.org/doc/install into /usr/local")
        sys.exit(0)

    # Check if go dir is already present
    if os.path.isdir(gopath):
        log.info("GO dev env already exists in " + gopath)
    else:
        log.info("Please wait...Creating GO dev env in " + gopath)
        try:
            os.makedirs(gopath)
            os.makedirs(gopath + "bin")
            os.makedirs(gopath + "src")
            os.makedirs(gopath + "pkg")
            # Create a softlink of the apiserver inside gopath
            os.makedirs(apiserver_parent_dir)
        except OSError:
            log.info("Error creating gopath directories...")
        # Install go dep
        cmd = "go get -u github.com/golang/dep/cmd/dep"
        run_cmd(cmd)

        cmd = "cd " + apiserver_parent_dir + " && ln -s ../../../../../../searchServer"
        run_cmd(cmd)

        # dep ensure
        #cmd = "cd " + apiserver_parent_dir + "searchServer"  + " && dep ensure"
        #run_cmd(cmd)

        cmd = "go get github.com/gorilla/mux"
        run_cmd(cmd)
        cmd = "go get github.com/blevesearch/bleve"
        run_cmd(cmd)
        cmd = "go get github.com/blevesearch/bleve-mapping-ui"
        run_cmd(cmd)
        cmd = "go get github.com/blevesearch/snowballstem"
        run_cmd(cmd)
        cmd = "go get github.com/couchbase/moss"
        run_cmd(cmd)
        cmd = "go get github.com/syndtr/goleveldb/leveldb"
        run_cmd(cmd)
        cmd = "go get golang.org/x/text/unicode/norm"
        run_cmd(cmd)

        cmd = "go get github.com/willf/bitset"
        run_cmd(cmd)


        cmd = "go get github.com/mohae/deepcopy"
        run_cmd(cmd)


    return

def syncthing_init():

    # Check if syncthig is already cloned and pull latest if present else clone
    if os.path.isdir(syncthing_dir):
        log.info("Pulling from syncthing:master...")

        cmd = "cd " + syncthing_dir + " && git pull"
        run_cmd(cmd)
    else:
        log.info("Cloning syncthing:master...")

        cmd = "git clone -b v1.0.0 https://github.com/syncthing/syncthing " + syncthing_dir
        run_cmd(cmd)

class Platform(object):
    '''This is a class of PlatformBoard
        Attributes:
            type: Type of Platform like raspbian, buildroot
    '''
    def __init__(self, platformtype, boardtype):
        self.type = platformtype
        self.board = Board(boardtype)

    def do_prepare(self):
        self.board.do_prepare()

    def do_config(self):
        self.board.do_config()

    def do_build(self):
        self.board.do_build()

    pass


class Board(object):
    '''This is a class of Board
        Attributes:
            type: Type of board like raspberrypi(rpi)
    '''
    def __init__(self, type):
        self.type = type
        pass

    def do_prepare(self):
        pass

    def do_config(self):
        pass

    def do_build(self):
        pass


    pass


class Device(object):
    '''This is a class of device
        Attributes:
            type: Type of device like edgemedia
            board: Class for Board(rpi, opi etc)  information
            platform: Class for Platform(raspbian, buildroot etc) information
    '''
    def __init__(self, devicetype, platformtype, boardtype):
        self.platform = Platform(platformtype, boardtype)
        self.devicetype = devicetype
        self.platformtype = platformtype
        self.boardtype = boardtype
        self.build_output_dir = build_dir + 'output_' + platformtype + '_' + boardtype + '_' + devicetype + "/"
        # 'opencdn' directory inside build where the tgz will be created
        self.imgdir = self.build_output_dir + "opencdn/"
        self.distdir = self.build_output_dir + "dist/"
        try:
            os.makedirs(self.build_output_dir)
        except OSError:
            if not os.path.isdir(self.build_output_dir):
                raise
        self.logging_init()

        pass

    def __str__(self):
        return ("Type: %s, Board: %s, Platform: %s\n" %
        (self.type, self.board.type, self.platform.type))

    def logging_init(self):
        self.log = logging.getLogger('ORAP')
        self.log.setLevel(logging.DEBUG)

        # create formatter and add it to the handlers
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        build_logfilename = self.build_output_dir + build_logfile

        #Needed to log output of subprocess.Popen
        self.logfd = open(build_logfilename, "a")

        # create file handler which logs even debug messages
        fh = logging.FileHandler(build_logfilename)
        fh.setLevel(logging.DEBUG)
        fh.setFormatter(formatter)
        self.log.addHandler(fh)

        # create console handler with a higher log level
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        ch.setFormatter(formatter)
        self.log.addHandler(ch)
        # Keep a global reference of the logger
        global log
        log = self.log
        global logfd
        logfd = self.logfd
        self.log.info("Logfile: " + build_logfilename)

    def do_prepare(self):
        '''Ensure all directory structure and files are present'''

        golang_init()

        syncthing_init()

        # Create a 'opencdn' directory inside build where all the files will be copied
        try:
            os.makedirs(self.imgdir)
        except OSError:
            if not os.path.isdir(self.imgdir):
                raise

        # Create a 'dist' directory inside build where the tgz will be created
        try:
            os.makedirs(self.distdir)
        except OSError:
            if not os.path.isdir(self.distdir):
                raise

        self.platform.do_prepare()


    def do_config(self):
        self.platform.do_config()

    def do_clean(self):
        # Delete the output directory

        cmd = "rm -rf  " + self.build_output_dir
        run_cmd(cmd)

    def do_build(self):

        # copy CDN dir
        cmd = "cp -r " + cdn_dir + " " + self.imgdir
        run_cmd(cmd)

        #npm install in db sdk
        cmd = "cd dbsdk && npm install"
        run_cmd(cmd)

        # copy dbsdk
        cmd = "cp -r " + dbsdk_dir + " " + self.imgdir
        run_cmd(cmd)

        #npm install in db sdk
        cmd = "cd dbsdk2 && npm install"
        run_cmd(cmd)

        # copy dbsdk
        cmd = "cp -r " + dbsdk2_dir + " " + self.imgdir
        run_cmd(cmd)

        #npm install in file sdk
        cmd = "cd filesdk && npm install"
        run_cmd(cmd)

        # copy filesdk
        cmd = "cp -r " + filesdk_dir + " " + self.imgdir
        run_cmd(cmd)

        #npm install in search sdk
        cmd = "cd searchsdk && npm install"
        run_cmd(cmd)

        # copy search sdk
        cmd = "cp -r " + searchsdk_dir + " " + self.imgdir
        run_cmd(cmd)

        #npm install in telemetry sdk
        cmd = "cd telemetrysdk && npm install"
        run_cmd(cmd)

        # copy telemetry sdk
        cmd = "cp -r " + telemetrysdk_dir + " " + self.imgdir
        run_cmd(cmd)

        #npm install in app server
        cmd = "cd appServer && npm install"
        run_cmd(cmd)

        # copy app server
        cmd = "cp -r " + appServer_dir + " " + self.imgdir
        run_cmd(cmd)

        #npm installl in devicemgmt server
        cmd = "cd devmgmtV2 && npm install"
        run_cmd(cmd)

        # copy devmgmt server
        cmd = "cp -r " + dmserver_dir + " " + self.imgdir
        run_cmd(cmd)

        #build frontend for device management
        cmd = "cd devmgmtui && npm install && npm run build"
        run_cmd(cmd)



        # copy devmgmtui build to rootfs overlay
        cmd = "cp -r devmgmtui/build/* rootfs_overlay/var/www/html/admin/"
        run_cmd(cmd)

        # Copy rootfs_overlay first
        cmd = "cp -r " + rootfs_dir + " " + self.imgdir
        run_cmd(cmd)

        # Compile golang apiserver; create the executable in CDN directory
        log.info("go env path " + os.environ['GOPATH'])
        cmd = "cd " + self.imgdir + "CDN/" + " && env CGO_ENABLED=0 GOOS=linux " + "GOARCH=" + GOARCH + "  go build github.com/projectOpenRAP/OpenRAP/searchServer"
        run_cmd(cmd)

        # Compiling Syncthing and moving the executable to the CDN directory
        cmd = "cd " + syncthing_dir + " && env CGO_ENABLED=0 go run build.go -pkgdir " + (gopath + "pkg/linux_arm") + " -goos linux -goarch " + GOARCH + " build && mv ./syncthing " + (self.imgdir + "CDN/")
        run_cmd(cmd)

        #TODO: Copy the devicemgmt code
        self.platform.do_build()

    def do_pkg(self):
        pass

    pass # class Device

class Profile(Device):
    '''This is a class of Board
        Attributes:
            type: Type of board like raspberrypi(rpi)
    '''
    def __init__(self, profiletype, devicetype, platformtype, boardtype):
        super().__init__(devicetype, platformtype, boardtype)
        self.profiletype = profiletype
        self.hostname = hostname_get(profiletype)

    def do_prepare(self):
        super().do_prepare()

    def do_config(self):
        super().do_config()

    def do_build(self):
        print("calling do_build: board[%s] platform[%s] device[%s] profile[%s]\n" %
            (self.boardtype, self.platformtype, self.devicetype, self.profiletype))
        super().do_build()

        # Copy rootfs_overlay first
        cmd = "cp -rf profile/" + self.profiletype + "/rootfs_overlay" + " " + self.imgdir
        run_cmd(cmd)

        # Update /etc/hostname file
        filename = self.imgdir + "rootfs_overlay/etc/hostname"
        file_hostname_update(filename, self.hostname)

        # Update /etc/hosts file
        filename = self.imgdir + "rootfs_overlay/etc/hosts"
        file_hosts_update(filename, self.hostname)

        # Update /etc/hostapd/hostapd.conf file
        filename = self.imgdir + "rootfs_overlay/etc/hostapd/hostapd.conf"
        file_hostapdconf_update(filename, self.hostname)

        # Update /opt/opencdn/CDN/profile.json file
        filename = self.imgdir + "CDN/profile.json"
        file_profilejson_update(filename, self.profiletype)

    def do_pkg(self):
        super().do_pkg()

        ver_file = self.imgdir + "CDN/version.txt"
        version = version_get(ver_file)
        file_version_update(ver_file, version)
        tgz_file = "openrap-" + version + ".tgz"
        cmd = "cd " + self.distdir + " && tar -zcf " + tgz_file + "   ../opencdn"
        run_cmd(cmd)
        log.info("final image: " + self.distdir + tgz_file)

    def do_clean(self):
        print("clean: board[%s] platform[%s] device[%s] profile[%s]\n" %
            (self.boardtype, self.platformtype, self.devicetype, self.profiletype))

        # Modify /etc/hosts /etc/hostname /etc/hostpad/hostapd.conf /etc/avahi/services/. etc
        super().do_clean()

    pass #class Profile



def run_cmd(cmd):
    #print(log_file, "executing: %s" % cmd)
    log.info("cmd: %s" % cmd)
    p = subprocess.Popen(cmd, shell=True, stdout=logfd, stderr=subprocess.PIPE)
    (result, error) = p.communicate()
    if p.returncode != 0:
        log.error("Error cmd: %s" % cmd)
        print(error)
        sys.exit(p.returncode)

##########################################################

boardlist = ["rpi", "opi", "minipc", "tinkerboard"]
platformlist = ["raspbian", "armbian", "ubuntu", "tinkeros"]
devicelist = ["openrap"]
profilelist = ["ekstep"]


if __name__ == '__main__':
    argparser = argparse.ArgumentParser()
    argparser.add_argument("--board", choices=boardlist, default="rpi", help="Select board type for image (default = \"rpi\")")
    argparser.add_argument("--platform", choices=platformlist, default="raspbian", help="Select platforn type for image (default = \"raspbian\")")
    argparser.add_argument("--profile", choices=profilelist, default="ekstep", help="Select profile (default = \"ekstep\")")
    argparser.add_argument("--clean", dest="clean",  action='store_true', help="Select type of image to clean (default = \"openrap\")")
    args = argparser.parse_args()

    (board, platform, profile, clean) = (args.board, args.platform, args.profile, args.clean)
    device="openrap"

    if board == "minipc":
        GOARCH='386'

    d = Profile(profile, device, platform, board)
    if args.clean:
        d.do_clean()
    else:
        d.do_prepare()
        d.do_config()
        d.do_build()
        d.do_pkg()

    sys.exit(0)
