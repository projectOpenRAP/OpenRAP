//  Copyright (c) 2014 Couchbase, Inc.
//  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
//  except in compliance with the License. You may obtain a copy of the License at
//    http://www.apache.org/licenses/LICENSE-2.0
//  Unless required by applicable law or agreed to in writing, software distributed under the
//  License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
//  either express or implied. See the License for the specific language governing permissions
//  and limitations under the License.

package main

import (
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
    "encoding/json"
	"github.com/gorilla/mux"
	"github.com/blevesearch/bleve"
	bleveMappingUI "github.com/blevesearch/bleve-mapping-ui"
	bleveHttp "github.com/blevesearch/bleve/http"

	// import general purpose configuration
	_ "github.com/blevesearch/bleve/config"

	//"github.com/projectOpenRAP/OpenRAP/searchServer/edu"
)

var createIndexHandlerGlobal *(bleveHttp.CreateIndexHandler)

func createAndInitIndexHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("calling createAndInitIndexHandler")
	pathVariable := mux.Vars(r)
	indexName := pathVariable["indexName"]
	log.Printf(indexName)
	createIndexHandlerGlobal.ServeHTTP(w, r)
	index := bleveHttp.IndexByName(indexName)
	if index == nil {
		log.Printf("no such index '%s'", indexName)
		return
	}
	log.Printf("checkpoint 1 : %s",r.URL.Path)
	jsonDir := r.URL.Query().Get("jsonDir")
	log.Printf(jsonDir)
	dirEntries, err := ioutil.ReadDir(jsonDir)
	if err != nil {
		log.Printf("cannot open directory")
		return
	}
	count := 0
	startTime := time.Now()
	batch := index.NewBatch()
	batchCount := 0
	batchSize := 50
	for _, dirEntry := range dirEntries {
		filename := dirEntry.Name()
		logger.Trace.Printf("Bulk addition to Index: %s\n", filename)
		// read the bytes
		jsonBytes, err := ioutil.ReadFile(jsonDir + "/" + filename)
		if err != nil {
			log.Printf("error while reading file")
			continue
		}

		// parse bytes as json
		var jsonDoc interface{}
		err = json.Unmarshal(jsonBytes, &jsonDoc)
		if err != nil {
			log.Printf("error while unmarshal file: %s\n", filename)
			continue
		}


		batch.Index(filename, jsonDoc)
		batchCount++
		if batchCount >= batchSize {
			err = index.Batch(batch)
			if err != nil {
				return
			}
			batch = index.NewBatch()
			batchCount = 0
		}
		count++
		if count%1000 == 0 {
			indexDuration := time.Since(startTime)
			indexDurationSeconds := float64(indexDuration) / float64(time.Second)
			timePerDoc := float64(indexDuration) / float64(count)
			logger.Trace.Printf("Indexed %d documents, in %.2fs (average %.2fms/doc)",
			count, indexDurationSeconds, timePerDoc/float64(time.Millisecond))
		}

	}
	if batchCount > 0 {
		err = index.Batch(batch)
		if err != nil {
			log.Printf("error while flushing")
			log.Fatal(err)
		}
	}
	indexDuration := time.Since(startTime)
	indexDurationSeconds := float64(indexDuration) / float64(time.Second)
	timePerDoc := float64(indexDuration) / float64(count)
	logger.Info.Printf("Indexed %d documents, in %.2fs (average %.2fms/doc)", count, indexDurationSeconds, timePerDoc/float64(time.Millisecond))
	return
}

func loadIndexAndServe(indexDir, bindAddr string) {

	// walk the data dir and register index names
	dirEntries, err := ioutil.ReadDir(indexDir)
	if err != nil {
		log.Fatalf("error reading data dir: %v", err)
	}

	for _, dirInfo := range dirEntries {
		indexPath := indexDir + string(os.PathSeparator) + dirInfo.Name()

		// skip single files in data dir since a valid index is a directory that
		// contains multiple files
		if !dirInfo.IsDir() {
			log.Printf("Deleting unknown db: %s", indexPath)
			os.RemoveAll(indexPath)

			continue
		}

		i, err := bleve.Open(indexPath)
		if err != nil {
			log.Printf("error opening index %s: %v", indexPath, err)
			os.RemoveAll(indexPath)
		} else {
			log.Printf("registered index: %s", dirInfo.Name())
			bleveHttp.RegisterIndexName(dirInfo.Name(), i)
			// set correct name in stats
			i.SetName(dirInfo.Name())
		}
	}

	router := mux.NewRouter()
	router.StrictSlash(true)

	// add edu routes
	// edu.EduInit(router)

	// add the API
	bleveMappingUI.RegisterHandlers(router, "/api")

	createIndexHandler := bleveHttp.NewCreateIndexHandler(indexDir)
	createIndexHandler.IndexNameLookup = indexNameLookup
	createIndexHandlerGlobal = createIndexHandler
	//router.Handle("/api/search/v2/index/{indexName}", createIndexHandler).Methods("PUT")
    router.HandleFunc("/api/search/v2/index/{indexName}", createAndInitIndexHandler).Methods("PUT") 

	getIndexHandler := bleveHttp.NewGetIndexHandler()
	getIndexHandler.IndexNameLookup = indexNameLookup
	router.Handle("/api/search/v2/index/{indexName}", getIndexHandler).Methods("GET")

	deleteIndexHandler := bleveHttp.NewDeleteIndexHandler(indexDir)
	deleteIndexHandler.IndexNameLookup = indexNameLookup
	router.Handle("/api/search/v2/index/{indexName}", deleteIndexHandler).Methods("DELETE")

	listIndexesHandler := bleveHttp.NewListIndexesHandler()
	router.Handle("/api/search/v2/index", listIndexesHandler).Methods("GET")

	docIndexHandler := bleveHttp.NewDocIndexHandler("")
	docIndexHandler.IndexNameLookup = indexNameLookup
	docIndexHandler.DocIDLookup = docIDLookup
	router.Handle("/api/search/v2/index/{indexName}/document/{docID}", docIndexHandler).Methods("PUT")

	docCountHandler := bleveHttp.NewDocCountHandler("")
	docCountHandler.IndexNameLookup = indexNameLookup
	router.Handle("/api/search/v2/index/{indexName}/_count", docCountHandler).Methods("GET")

	docGetHandler := bleveHttp.NewDocGetHandler("")
	docGetHandler.IndexNameLookup = indexNameLookup
	docGetHandler.DocIDLookup = docIDLookup
	router.Handle("/api/search/v2/index/{indexName}/document/{docID}", docGetHandler).Methods("GET")

	docDeleteHandler := bleveHttp.NewDocDeleteHandler("")
	docDeleteHandler.IndexNameLookup = indexNameLookup
	docDeleteHandler.DocIDLookup = docIDLookup
	router.Handle("/api/search/v2/index/{indexName}/document/{docID}", docDeleteHandler).Methods("DELETE")

	searchHandler := bleveHttp.NewSearchHandler("")
	searchHandler.IndexNameLookup = indexNameLookup
	router.Handle("/api/search/v2/index/{indexName}/_search", searchHandler).Methods("POST")

	listFieldsHandler := bleveHttp.NewListFieldsHandler("")
	listFieldsHandler.IndexNameLookup = indexNameLookup
	router.Handle("/api/search/v2/index/{indexName}/_fields", listFieldsHandler).Methods("GET")

	debugHandler := bleveHttp.NewDebugDocumentHandler("")
	debugHandler.IndexNameLookup = indexNameLookup
	debugHandler.DocIDLookup = docIDLookup
	router.Handle("/api/search/v2/index/{indexName}/document/{docID}/_debug", debugHandler).Methods("GET")

	aliasHandler := bleveHttp.NewAliasHandler()
	router.Handle("/api/search/v2/_aliases", aliasHandler).Methods("POST")

	// start the HTTP server
	http.Handle("/", router)
	log.Printf("Listening on %v", bindAddr)
	log.Fatal(http.ListenAndServe(bindAddr, nil))
}
