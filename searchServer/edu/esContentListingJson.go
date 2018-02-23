package edu

import (
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/mohae/deepcopy" //to copy a slice
)

//var ContentHomeConfigGlobal ContentHomeConfig

type ContentListingJson struct {
	Page ContentHomeUtilPage `json:"page"`
}

/*
POST /api/page/v1/assemble/org.ekstep.genie.content.home
Accept-Encoding: gzip, deflate
Content-Type: application/json; charset=utf-8
Content-Length: 216
Host: cdn.pinut.com
Connection: Keep-Alive
*/

type ContentHomeRequestRequest struct {
	Context struct {
		Contentid string `json:"contentid"` //
		Did       string `json:"did"`       // 4e7839c64fe0b2da27a3d322a851a9038ee20240
		Dlang     string `json:"dlang"`     // en
		Uid       string `json:"uid"`       // 7c68ee48-7695-473f-8699-d1de2ff32beb
	} `json:"context"`
	Filters CommonUtilFilters `json:"filters"`
}

type ContentHomeRequest struct {
	ID      string                    `json:"id"`  // ekstep.genie.content.home
	Ets     int64                     `json:"ets"` // 1.499853989625e+12
	Request ContentHomeRequestRequest `json:"request"`
	//Ver string `json:"ver,string"` // 1.0
	Ver string `json:"ver"` // 1.0
}
type ContentHomeResponseResult struct {
	Page ContentHomeUtilPage `json:"page"`
}

type ContentHomeResponse struct {
	ID     string                    `json:"id"` // ekstep.genie.content.home
	Params CommonUtilParams          `json:"params"`
	Result ContentHomeResponseResult `json:"result"`
	Ts     time.Time                 `json:"ts"`  // 2017-06-13T12:05:30+00:00
	Ver    string                    `json:"ver"` // 1.0
}

/*
 * Response to create the first page in mobile app
 */
func contentHomeResponseGenerate(chReq *ContentHomeRequest) (ContentHomeResponse, error) {
	var ch ContentHomeResponse

	fmt.Println("contentHomeResponseGenerate start...\n")

	/*
	 * This dynamic json data will be constructed based on the
	 * global config and request body
	 * Dynamic search api will be called to construct the page sections
	 */

	//Fill the id (from the request body)
	ch.ID = chReq.ID
	//Fill the version (from the request body)
	ch.Ver = chReq.Ver
	//TODO: Fill the timestamp

	//redData is "request:" data in the body
	var err error
	var reqData ContentHomeRequestRequest
	reqData = chReq.Request
	//log.Printf("%s", toJson(reqData))
	//	var sections []ContentHomeConfigPageSections
	//sections := ContentHomeConfigGlobal.Page.Sections
	tmpSections := deepcopy.Copy(EkstepConfigGlobal.contentJson.Page.Sections)
	sections := tmpSections.([]ContentHomeUtilPageSections)

	//  page := ch.Result.Page
	//	log.Printf("%s", toJson(page))
	//	docs := make([]EcarManifest, 0)

	for idx, section := range sections {

		docs, err := SearchContentHomePageSection(&section, &reqData)
		//	    raw, err := ioutil.ReadFile("search/contentHomeResponse.json")
		if err != nil {
			fmt.Println("Error opening JSON file:", err)
			return ch, err
		}

		for _, d := range docs {
			//sections[idx].Contents = append(sections[idx].Contents, d.Archive.Items...)
			sections[idx].Contents = append(sections[idx].Contents, d)
		}
	}

	//json.Unmarshal(raw, &ch)
	//	fmt.Println(ch.toString())
	ch.Result.Page.Sections = sections
	ch.Result.Page.ID = EkstepConfigGlobal.contentJson.Page.ID

	//TODO: Fill the "params:"
	ch.Params.Resmsgid = "c3800c567711b10e128d3b1353328a60f6bb5583"
	ch.Params.Msgid = "ff305d54-85b4-341b-da2f-eb6b9e5460fa"
	ch.Params.Status = "successful"
	ch.Params.Err = ""
	ch.Params.Errmsg = ""

	return ch, err
}

func (p ContentHomeResponse) toString() string {
	return toJsonStr(p)
}

func toJsonStr(p interface{}) string {
	bytes, err := json.Marshal(p)
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}
	return string(bytes)
}
