package main

import (
	"flag"
	"log"
	"os"

	"github.com/projectOpenRAP/OpenRAP/searchServer/config"
)

var (
	httpAddr                       string
	bleveDbDir, indexName          string
	telemetryEnable, devmgmtEnable bool
	indexDbPath                    string
	logger                         *config.Tracelog
)

func createActiveProfileDirectories(activeProfile config.DeviceInfo) {
	var pathErr error
	// Create directories based on profile.json
	dirpath := []string{
		activeProfile.ConfigJsonDir,
		activeProfile.JsonDir,
		activeProfile.ContentRoot,
		activeProfile.UnzipContent,
		activeProfile.Telemetry}

	for _, dp := range dirpath {
		logger.Trace.Printf("Creating dir: %s", dp)
		pathErr = os.MkdirAll(dp, 0755)
		if pathErr != nil {
			logger.Error.Println(pathErr)
		}
	}
}

func main() {
	flag.StringVar(&httpAddr, "http", "0.0.0.0:9095", "HTTP service ip:port")
	flag.StringVar(&bleveDbDir, "bleveDbDir", "/opt/searchEngine/bleveDbDir", "HTTP server root dir")
	flag.StringVar(&indexName, "index", "default.bleve", "index name")

	flag.Parse()

	//Load Device configuration
	config.DeviceConfigInit()
	dconfig := config.DeviceConfigGet()
	if dconfig == nil {
		log.Fatal("Couldn't parse config json")
	}
	//profile := dconfig.ActiveProfile.ProfileName

	logger = dconfig.Logger

	createActiveProfileDirectories(dconfig.ActiveProfile)

	loadIndexAndServe(bleveDbDir, httpAddr)

	//	serve(profile)
}
