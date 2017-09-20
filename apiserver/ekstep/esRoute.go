package ekstep

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/projectOpenRAP/OpenRAP/apiserver/config"
)

func byteToJson(p interface{}) ([]byte, error) {
	return json.Marshal(p)
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

	//Parse the json request
	var sreq SearchRequest
	//decoder := json.NewDecoder(r.Body)
	//err := decoder.Decode(&sreq)
	//if err != nil {
	//	//w.WriteHeader(http.StatusInternalServerError)
	//	http.Error(w, err.Error(), http.StatusBadRequest)
	//	log.Printf("Unable to parse search request: %s\n", err)
	//	return
	//}

	//Get the contentID from request
	params := mux.Vars(r)
	cid := params["contentID"]

	var ids []string = []string{cid}
	fmt.Println(ids)

	ch, err := searchByIdResponseGet(&sreq, ids)
	//	res, _ := SearchEcarByIdentifier(ids)
	//	ch, err := contentHomeResponseGenerate(&cReq)
	if err != nil {
		//w.WriteHeader(http.StatusInternalServerError)
		log.Printf("Error generating Search Response: %s\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	bytes, err := byteToJson(ch)
	w.Write(bytes)
}

//func learnHandlerbak(w http.ResponseWriter, r *http.Request) {
//	if r.Method == "POST" {
//		fmt.Fprintf(w, "Expecting a GET method")
//		return
//	}
//
//	//Get the contentID from request
//	params := mux.Vars(r)
//	cid := params["contentID"]
//
//	var ids []string = []string{cid}
//	fmt.Println(ids)
//
//	res, _ := SearchEcarByIdentifier(ids)
//	fmt.Printf("%s", res)
//	//fmt.Fprintf(w, res)
//	w.Header().Set("Content-Type", "application/json")
//	for _, item := range res {
//		raw, _ := json.Marshal(item)
//		w.Write(raw)
//	}
//}

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
		//w.WriteHeader(http.StatusInternalServerError)
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

func telemetryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		fmt.Fprintf(w, "Expecting a POST method")
		return
	}
	logger.Trace.Printf("telemetry Handler called...: %s", r.URL.Path)

	// Save the post binary data as gzip file
	fn := config.DeviceProfileTelemetryDir() + getfilename()
	fd, err := os.Create(fn)
	if err != nil {
		log.Printf("Telemetry: Unable to create file: %s\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer fd.Close()

	n, err := io.Copy(fd, r.Body)
	if err != nil {
		log.Printf("Telemetry: Error parsing post request: %s\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	logger.Trace.Printf("telemetry saved as: %s", fn)
	w.Write([]byte(fmt.Sprintf("%d bytes are recieved.\n", n)))
}

var n uint64

func getfilename() string {
	var t string
	n++
	t = fmt.Sprintf("%d_%s_%d.gz", n, "tm", time.Now().Unix())
	return t
}
