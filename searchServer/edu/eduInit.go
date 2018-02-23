package edu

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/projectOpenRAP/OpenRAP/searchServer/config"
)

type EkstepConfig struct {
	router      *mux.Router
	contentJson ContentListingJson
	//	contentJson ContentHomeConfig
	deviceConfig *config.DeviceConfig
}

var EkstepConfigGlobal *EkstepConfig
var logger *config.Tracelog

var routes map[string]http.HandlerFunc = map[string]http.HandlerFunc{
	"/api/search/v2/edu/init": eduInitHandler,
	//API for homepage
	"/api/search/v2/edu/homepage":        contentHomeHandler,
	"/api/search/v2/edu/doc/{contentID}": contentIdHandler,

	//API for different types of search
	"/api/search/v2/edu/search": searchHandler,
	//QA api
	"/api/composite/v3/search": searchHandler,

	//Private api
	//API to add/remove ecar from search index
	"/api/ekstepdb/{jsonfile}": ekstepIndexJsonFileHandler,
}

func EduInit(router *mux.Router) {
	c := &EkstepConfig{}

	//Load Device configuration
	c.deviceConfig = config.DeviceConfigGet()
	if c.deviceConfig == nil {
		logger.Error.Fatal("ES: Couldn't parse device config json")
	}
	logger = c.deviceConfig.Logger

	c.router = router
	c.contentJson = c.ContentListingJsonLoad()
	c.registerRoute()
	EkstepConfigGlobal = c

	uuidInit()
	//Call it from API
	//eduSearchInit("/opt/searchEngine/bleveDbDir", "es.db", "/var/www/ekstep/json_dir")
	logger.Trace.Println("ES module initialized...")
}

func (ms *EkstepConfig) ContentListingJsonLoad() ContentListingJson {
	var c ContentListingJson

	cj := ms.deviceConfig.ConfigJsonAbsFilename()

	raw, err := ioutil.ReadFile(cj)
	if err != nil {
		logger.Error.Printf("ES: Error opening content json file: %v", err)
		return c
	}
	json.Unmarshal(raw, &c)
	return c
}

func (c *EkstepConfig) registerRoute() error {
	for route, handler := range routes {
		c.router.HandleFunc(route, handler)
	}
	logger.Trace.Println("ES: Registered route for REST api")
	return nil
}

var RFd *os.File

func uuidInit() {
	f, err := os.Open("/dev/urandom")
	if err != nil {
		log.Fatal(err)
	}
	RFd = f
}

func UUIDGet() string {
	b := make([]byte, 16)
	RFd.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
