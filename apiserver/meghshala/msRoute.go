package meghshala

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
)

func byteToJson(p interface{}) ([]byte, error) {
	return json.Marshal(p)
}

type TeachkitDownloadResponse struct {
	DownloadLink string `json:"download_link"` //
	Size         int64  `json:"size"`          // 1.3904117e+07
	Status       int64  `json:"status"`        // 1
}

/*
 * Response to create the first page in mobile app
 */
func msTeachkitDownloadResponseNew(docid int64, filename, contentroot, cdnurl, sessid string, status int64, cs *ContentStatsInfo) (TeachkitDownloadResponse, error) {
	var res TeachkitDownloadResponse
	var err error

	logger.Trace.Printf("Coursekit [id: %d] name: %s\n", docid, filename)

	cs.teachkitStatsAddAndSave(sessid, docid, filename)

	absfilename := contentroot + filename
	fi, e := os.Stat(absfilename)
	if e != nil {
		err = e
		goto notFoundInDevice
	}
	res.Size = fi.Size()
	res.Status = status
	res.DownloadLink = cdnurl + "/content/" + filename
	return res, err

notFoundInDevice:

	return res, err
}

/*
 * Response to search query for course kit
 */
func msTeachkitDownloadResponseGenerate(sessid string, docid int64) (TeachkitDownloadResponse, error) {
	var res TeachkitDownloadResponse
	var err error

	// Get status from saved contentJson
	cj := MeghshalaConfigGlobal.contentJson
	dj := MeghshalaConfigGlobal.deviceConfig
	cs := MeghshalaConfigGlobal.contentStatsInfo
	tm := MeghshalaConfigGlobal.teachkitIdMap
	crp := dj.ContentRootPath()
	cdnurl := dj.CdnURL()
	status := cj.Status

	filename, _ := tm[docid]
	if filename == "" {
		err = fmt.Errorf("Coursekit [id: (%d)] NOT FOUND in Device\n", docid)
		logger.Warning.Printf("Coursekit [id: (%d)] NOT FOUND in Device\n", docid)
		return res, err
	}

	// File found for this id
	res, err = msTeachkitDownloadResponseNew(docid, filename, crp, cdnurl, sessid, status, cs)
	return res, err
}

func teachkitHandler(w http.ResponseWriter, r *http.Request) {
	var errStream = []byte(`{"status":0,"error_description":"This teachkit have been removed by the admin.","error":"112"}`)

	if r.Method == "POST" {
		fmt.Fprintf(w, "Expecting a GET request for teachkit...")
		return
	}

	sid := r.URL.Query().Get("session_id")
	if len(sid) == 0 {
		// Since sessionid is not important to us, try to proceed

		fmt.Println("Error parsing session_id field...ignoring... ")
		//w.WriteHeader(http.StatusInternalServerError)
		//w.Write([]byte(sessionid))
		//return
	}

	idStr := r.URL.Query().Get("id")
	did, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		//w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("Error parsing id field ", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := msTeachkitDownloadResponseGenerate(sid, did)
	if err != nil {
		//http.Error(w, err.Error(), http.StatusInternalServerError)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write(errStream)
		return
	}

	logger.Trace.Printf("Sess_id: %s requested for File_id: %d\n", sid, did)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	bytes, err := byteToJson(res)
	w.Write(bytes)
}

/*
 * Response to statistics
 */

func contentStatsHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method == "POST" {
		fmt.Fprintf(w, "Expecting a GET request for teachkit...")
		return
	}

	res := *MeghshalaConfigGlobal.contentStatsInfo.contentStats

	w.Header().Set("Content-Type", "application/json")
	bytes, _ := byteToJson(res)
	w.Write(bytes)
}
