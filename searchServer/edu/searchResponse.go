package edu

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	_ "time"
)

type SearchRequest struct {
	Request CommonUtilPageSectionsSearch `json:"request"`
}

type SearchResponse struct {
	ID     string           `json:"id"` // ekstep.composite-search.search
	Params CommonUtilParams `json:"params"`

	ResponseCode string `json:"responseCode"` // OK
	Result       struct {
		Content []EcarManifestArchiveItems `json:"content,omitempty"`
		Count   int64                      `json:"count"` // 674
		Facets  []struct {
			Name   string `json:"name"` // gradeLevel
			Values []struct {
				Count int64  `json:"count"` // 146
				Name  string `json:"name"`  // other
			} `json:"values"`
		} `json:"facets,omitempty"`
	} `json:"result"`
	Ts  string  `json:"ts"`         // 2017-06-21T08:45:23ZZ
	Ver float64 `json:"ver,string"` // 2.0
}

type SearchIdResponse struct {
	ID     string           `json:"id"` // ekstep.composite-search.search
	Params CommonUtilParams `json:"params"`

	ResponseCode string `json:"responseCode"` // OK
	Result       struct {
		Content EcarManifestArchiveItems `json:"content,omitempty"`
		Count   int64                    `json:"count"` // 674
		Facets  []struct {
			Name   string `json:"name"` // gradeLevel
			Values []struct {
				Count int64  `json:"count"` // 146
				Name  string `json:"name"`  // other
			} `json:"values"`
		} `json:"facets,omitempty"`
	} `json:"result"`
	Ts  string  `json:"ts"`         // 2017-06-21T08:45:23ZZ
	Ver float64 `json:"ver,string"` // 2.0
}

/*
 * Response to find ecar by identifier
 */
func searchByIdResponseGet(sReq *SearchRequest, ids []string) (SearchIdResponse, error) {
	var ch SearchIdResponse

	fmt.Println("searchByIdResponseGet start...\n")

	//Fill the id, req might not have ID
	ch.ID = "ekstep.content.find"
	//Fill the version, req might not have ID (may be api version)
	ch.Ver = 3.0
	//TODO: Fill the timestamp

	//redData is "request:" data in the body
	var err error
	var reqData CommonUtilPageSectionsSearch
	reqData = sReq.Request
	log.Printf("%s", toJson(reqData))

	//docs, err := SearchStandardQuery(&reqData)
	docs, err := SearchEcarByIdentifier(ids)
	if err != nil {
		fmt.Println("Error to serve standard search...")
		return ch, err
	}

	ch.Result.Content = docs
	//for _, d := range docs {
	//	ch.Result.Content = append(ch.Result.Content, d)
	//	ch.Result.Count++
	//}

	//TODO: Fill the "params:"
	ch.Params.Resmsgid = UUIDGet()
	//	ch.Params.Msgid = "ff305d54-85b4-341b-da2f-eb6b9e5460fa"
	ch.Params.Status = "successful"
	//	ch.Params.Err = ""
	//	ch.Params.Errmsg = ""

	ch.ResponseCode = "OK"

	return ch, err
}

/*
 * Response to create the first page in mobile app
 */
func searchResponseGet(sReq *SearchRequest) (SearchResponse, error) {
	var ch SearchResponse

	fmt.Println("contentHomeResponseGenerate start...\n")

	/*
	 * This dynamic json data will be constructed based on the
	 * global config and request body
	 * Dynamic search api will be called to construct the page sections
	 */

	//Fill the id, req might not have ID
	ch.ID = "ekstep.composite-search.search"
	//Fill the version, req might not have ID (may be api version)
	ch.Ver = 2.0
	//TODO: Fill the timestamp

	//redData is "request:" data in the body
	var err error
	var reqData CommonUtilPageSectionsSearch
	reqData = sReq.Request
	log.Printf("%s", toJson(reqData))

	docs, err := SearchStandardQuery(&reqData)
	if err != nil {
		fmt.Println("Error to serve standard search...")
		return ch, err
	}

	for _, d := range docs {
		//ch.Result.Content = append(ch.Result.Content, d.Archive.Items...)
		ch.Result.Content = append(ch.Result.Content, d)
		ch.Result.Count++
	}

	//TODO: Fill the "params:"
	ch.Params.Resmsgid = UUIDGet()
	//	ch.Params.Msgid = "ff305d54-85b4-341b-da2f-eb6b9e5460fa"
	ch.Params.Status = "successful"
	//	ch.Params.Err = ""
	//	ch.Params.Errmsg = ""

	ch.ResponseCode = "OK"

	return ch, err
}

func searchResponseGet2() SearchResponse {
	var ch SearchResponse

	raw, err := ioutil.ReadFile("search/searchResponse.json")
	if err != nil {
		fmt.Println("Error opening JSON file:", err)
		return ch
	}
	err = json.Unmarshal(raw, &ch)
	fmt.Println(ch.toString())
	return ch
}

func (p SearchResponse) toString() string {
	return toJson(p)
}

func toJson(p interface{}) string {
	bytes, err := byteToJson(p)
	if err != nil {
		fmt.Println(err.Error())
		return ""
	}

	return string(bytes)
}
