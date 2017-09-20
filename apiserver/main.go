package main

import (
	"flag"
	"log"

	"github.com/projectOpenRAP/OpenRAP/apiserver/config"
)

var (
	httpAddr, dataDir              string
	bleveDbDir, indexName          string
	telemetryEnable, devmgmtEnable bool
	indexDbPath                    string
	logger                         *config.Tracelog
)

func main() {
	flag.StringVar(&httpAddr, "http", "0.0.0.0:9090", "HTTP service ip:port")
	flag.StringVar(&dataDir, "dataDir", "", "HTTP server root dir")
	flag.BoolVar(&telemetryEnable, "telemetry", true, "Enable search API")
	flag.BoolVar(&devmgmtEnable, "devmgmt", true, "Enable search API")
	//	flag.StringVar(&jsonDir, "jsonDir", "/var/www/ekstep/jsonDir", "HTTP server root dir")
	flag.StringVar(&bleveDbDir, "bleveDbDir", "/var/www/ekstep/bleveDbDir", "HTTP server root dir")
	flag.StringVar(&indexName, "index", "ekstep.bleve", "HTTP server root dir")

	flag.Parse()

	//Load Device configuration
	config.DeviceConfigInit()
	dconfig := config.DeviceConfigGet()
	if dconfig == nil {
		log.Fatal("Couldn't parse config json")
	}
	profile := dconfig.ActiveProfile.ProfileName

	if dataDir == "" {
		dataDir = dconfig.ActiveProfile.MediaRoot
	}
	logger = dconfig.Logger

	//logfile := dconfig.ActiveProfile.MediaRoot + "apiserver.log"
	//LoggerInit(logfile)
	//logger.Trace.Printf("apiserver log stores into: %s\n", logfile)

	/*
		jd := config.DeviceDataJsonDirPath()
		if jd == nil {
			log.Fatal("Couldn't found json directory in config json")
		}

		indexDbPath := bleveDbDir + string(os.PathSeparator) + indexName
		log.Printf("index path: %s\n", indexDbPath)
		SearchInit(bleveDbDir, indexName, *jd)
	*/
	serve(profile)
}
