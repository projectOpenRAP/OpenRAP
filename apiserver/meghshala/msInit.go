package meghshala

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"github.com/projectOpenRAP/OpenRAP/apiserver/config"
)

type MeghshalaConfig struct {
	router           *mux.Router
	contentJson      ContentJson
	deviceConfig     *config.DeviceConfig
	contentStatsInfo *ContentStatsInfo
	teachkitIdMap    TeachkitIdMap
}

var MeghshalaConfigGlobal *MeghshalaConfig
var logger *config.Tracelog

var routes map[string]http.HandlerFunc = map[string]http.HandlerFunc{
	//API for teachkit
	// "/apis/instructorapp/offline-teachkit-download/?session_id=c35e9a97ba85f04ee22e28a1e48db&id=3387" : teachkitHandler,
	"/apis/instructorapp/offline-teachkit-download/": teachkitHandler,
	"/apis/teachkit/stats":                           contentStatsHandler,
}

func MeghshalaInit(router *mux.Router) {
	m := &MeghshalaConfig{}

	//Load Device configuration
	m.deviceConfig = config.DeviceConfigGet()
	if m.deviceConfig == nil {
		logger.Error.Fatal("MS: Couldn't parse device config json")
	}

	logger = m.deviceConfig.Logger

	m.router = router
	m.contentJson = m.msContentJsonLoad()
	m.teachkitIdMap = m.msTeachkitIdMapInit()
	m.ContentStatsInfoInit()
	m.registerRoute()
	MeghshalaConfigGlobal = m
	logger.Trace.Println("MS module initialized...")
}

func (ms *MeghshalaConfig) msContentJsonLoad() ContentJson {
	var c ContentJson

	cj := ms.deviceConfig.ConfigJsonAbsFilename()

	raw, err := ioutil.ReadFile(cj)
	if err != nil {
		logger.Error.Fatalf("MS: Error opening content json file: %v", err)
		return c
	}
	json.Unmarshal(raw, &c)
	return c
}

func ms_dirlist_db(dirname string) (FileIdMap, error) {
	fileinfo := make(FileIdMap)
	logger.Trace.Printf("dirlist: Traversing directory: %s\n", dirname)
	// Traverse the directory and create a map with filename and id from the filename
	files, err := ioutil.ReadDir(dirname)
	if err != nil {
		logger.Error.Printf("MS: Error reading dir(%s): %v", dirname, err)
		return nil, err
	}

	for _, f := range files {
		filename := f.Name()
		lastdashindex := strings.LastIndex(filename, "_")
		idstr := filename[lastdashindex+1 : len(filename)-5]
		tasklistid, _ := strconv.ParseInt(idstr, 0, 64)

		logger.Info.Printf("dirlist: adding to fileinfo index: %s filename: %s\n", idstr, filename)
		//Prepend the CDN url inthe filename
		fileinfo[tasklistid] = filename
	}

	// Debugging
	for k, v := range fileinfo {
		logger.Trace.Printf("dirlist: index: %d filename: %s\n", k, v)
	}
	return fileinfo, err
}

func (ms *MeghshalaConfig) msTeachkitIdMapInit() TeachkitIdMap {
	var cm TeachkitIdMap = make(TeachkitIdMap)
	//var filemap FileIdMap
	// Create directory file listing
	// Create teachkitIdMap

	cj := ms.contentJson
	crp := ms.deviceConfig.ContentRootPath()
	filemap, err := ms_dirlist_db(crp)
	if err != nil {
		logger.Error.Printf("MS: Error opening content dir: %v", err)
		return cm
	}

	// Now go through the json file
	// Traverse the TeachkitList first
	for _, kit := range cj.TeachkitList {
		cm[kit.ID] = filemap[kit.TeachkitID]
		logger.Info.Printf("Indexing TeachkitList id: %d tkid: %d name: %s\n", kit.ID, kit.TeachkitID, cm[kit.ID])
	}

	// Traverse the ResourceList
	for _, kit := range cj.ResourceList {
		cm[kit.ID] = filemap[kit.TeachkitID]
		logger.Info.Printf("Indexing ResourceList id: %d tkid: %d name: %s\n", kit.ID, kit.TeachkitID, cm[kit.ID])
	}

	return cm
}

func (c *MeghshalaConfig) registerRoute() error {
	for route, handler := range routes {
		c.router.HandleFunc(route, handler)
	}
	logger.Trace.Println("MS: Registered route for REST api")
	return nil
}
