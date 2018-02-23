package edu

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/projectOpenRAP/OpenRAP/searchServer/config"
)

func byteToJson(p interface{}) ([]byte, error) {
	return json.Marshal(p)
}

func eduInitHandler(w http.ResponseWriter, req *http.Request) {
	/* decode the body into a structure */
	logger.Trace.Printf("eduInitHandler Handler called...: %s", req.URL.Path)
	dec := json.NewDecoder(req.Body)
	var cReq ContentHomeRequest
	for {
		if err := dec.Decode(&cReq); err == io.EOF {
			break
		} else if err != nil {
			log.Printf("Error parsing json body: %s\n", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}

	eduSearchInit("/opt/searchEngine/bleveDbDir", "es.db", "/var/www/ekstep/json_dir")

	w.Header().Set("Content-Type", "application/json")
}

func contentHomeHandler(w http.ResponseWriter, r *http.Request) {
	/* decode the body into a structure */
	logger.Trace.Printf("contentHome Handler called...: %s", r.URL.Path)
	dec := json.NewDecoder(r.Body)
	var cReq ContentHomeRequest
	for {
		if err := dec.Decode(&cReq); err == io.EOF {
			break
		} else if err != nil {
			log.Printf("Error parsing json body: %s\n", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	ch, err := contentHomeResponseGenerate(&cReq)
	if err != nil {
		//w.WriteHeader(http.StatusInternalServerError)
		log.Printf("Error generating ContentListing Response: %s\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	bytes, err := byteToJson(ch)
	w.Write(bytes)
}

func contentIdHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		fmt.Fprintf(w, "Expecting a GET method")
		return
	}
	logger.Trace.Printf("contentId Handler called...: %s", r.URL.Path)

	var sreq SearchRequest

	//Get the contentID from request
	params := mux.Vars(r)
	cid := params["contentID"]

	var ids []string = []string{cid}
	fmt.Println(ids)

	ch, err := searchByIdResponseGet(&sreq, ids)
	if err != nil {
		log.Printf("Error generating Search Response: %s\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	bytes, err := byteToJson(ch)
	w.Write(bytes)
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		fmt.Fprintf(w, "Expecting a POST method")
		return
	}
	logger.Trace.Printf("search Handler called...: %s", r.URL.Path)

	//Parse the json request
	decoder := json.NewDecoder(r.Body)
	var sreq SearchRequest
	err := decoder.Decode(&sreq)

	if err != nil {
		//w.WriteHeader(http.StatusInternalServerError)
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Printf("Unable to parse search request: %s\n", err)
		return
	}

	ch, err := searchResponseGet(&sreq)
	//	ch, err := contentHomeResponseGenerate(&cReq)
	if err != nil {
		log.Printf("Error generating Search Response: %s\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	bytes, err := byteToJson(ch)
	w.Write(bytes)
}

/* Add or detele from index a ecar json file */
func ekstepIndexJsonFileHandler(w http.ResponseWriter, r *http.Request) {
	//get the jsonFileName from the body
	params := mux.Vars(r)
	filename := params["jsonfile"]
	index := ekstepIndexGet()

	if index == nil {
		log.Printf("Filehandler: bleve index is null\n")
		return
	}

	jd := config.DeviceDataJsonDirPath()
	if jd == nil {
		log.Println("No data json directory found")
		return
	}

	if r.Method == "PUT" {
		EcarDbIndexAddJsonFile(index, *jd, filename)
		return
	}

	if r.Method == "DELETE" {
		EcarDbIndexRemoveJsonFile(index, *jd, filename)
		return
	}
}

var n uint64

func getfilename() string {
	var t string
	n++
	t = fmt.Sprintf("%d_%s_%d.gz", n, "tm", time.Now().Unix())
	return t
}
