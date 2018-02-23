package edu

import (
	"encoding/json"
)

type CommonUtilParams struct {
	Err      string `json:"err"`      //
	Errmsg   string `json:"errmsg"`   //
	Msgid    string `json:"msgid"`    // ff305d54-85b4-341b-da2f-eb6b9e5460fa
	Resmsgid string `json:"resmsgid"` // c3800c567711b10e128d3b1353328a60f6bb5583
	Status   string `json:"status"`   // successful
}

type CommonUtilFilters struct {
	AgeGroup           []string `json:"ageGroup,omitempty"` // 8-10
	Board              []string `json:"board,omitempty"`    // CBSE
	CompatibilityLevel struct {
		Max int64 `json:"max"` // 2
		Min int64 `json:"min"` // 1
	} `json:"compatibilityLevel,omitempty"`
	ContentType []string `json:"contentType,omitempty"` // Story
	Domain      []string `json:"domain,omitempty"`      // numeracy
	GradeLevel  []string `json:"gradeLevel,omitempty"`  // Grade 5
	GenieScore  struct {
		Min float64 `json:"min"` // 0
	} `json:"genieScore,omitempty"`
	Identifier []string `json:"identifier,omitempty"` // do_30031995
	Language   []string `json:"language,omitempty"`   // english
	Medium     []string `json:"medium,omitempty"`     // Hindi
	ObjectType []string `json:"objectType,omitempty"` // Content
	Subject    []string `json:"subject,omitempty"`    // domain
	Status     []string `json:"status,omitempty"`     // Live
}

type CommonUtilSortBy struct {
	GenieScore      string `json:"genieScore,omitempty"`      // desc
	LastPublishedOn string `json:"lastPublishedOn,omitempty"` //desc
	Popularity      string `json:"popularity,omitempty"`      //desc
}

type CommonUtilPageSectionsSearch struct {
	Facets  []string          `json:"facets,omitempty"` // contentType
	Filters CommonUtilFilters `json:"filters"`
	Limit   int               `json:"limit,omitempty"`
	Mode    string            `json:"mode,omitempty"` // soft
	Query   string            `json:"query"`
	SortBy  *CommonUtilSortBy `json:"sort_by"`
}

// merge merges the two JSON-marshalable values x1 and x2,
// preferring x1 over x2 except where x1 and x2 are
// JSON objects, in which case the keys from both objects
// are included and their values merged recursively.
//
// It returns an error if x1 or x2 cannot be JSON-marshaled.

func MergeJson(x1, x2 interface{}) (interface{}, error) {
	data1, err := json.Marshal(x1)
	if err != nil {
		return nil, err
	}
	data2, err := json.Marshal(x2)
	if err != nil {
		return nil, err
	}
	var j1 interface{}
	err = json.Unmarshal(data1, &j1)
	if err != nil {
		return nil, err
	}
	var j2 interface{}
	err = json.Unmarshal(data2, &j2)
	if err != nil {
		return nil, err
	}
	return merge1(j1, j2), nil
}

func merge1(x1, x2 interface{}) interface{} {
	switch x1 := x1.(type) {
	case map[string]interface{}:
		x2, ok := x2.(map[string]interface{})
		if !ok {
			return x1
		}
		for k, v2 := range x2 {
			if v1, ok := x1[k]; ok {
				x1[k] = merge1(v1, v2)
			} else {
				x1[k] = v2
			}
		}
	case nil:
		// merge(nil, map[string]interface{...}) -> map[string]interface{...}
		x2, ok := x2.(map[string]interface{})
		if ok {
			return x2
		}
	}
	return x1
}

func mergeFilters(x1, x2 *CommonUtilFilters) (*CommonUtilFilters, error) {
	data1, err := json.Marshal(x1)
	if err != nil {
		return nil, err
	}
	data2, err := json.Marshal(x2)
	if err != nil {
		return nil, err
	}
	var mf *CommonUtilFilters
	err = json.Unmarshal(data1, &mf)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(data2, &mf)
	if err != nil {
		return nil, err
	}
	return mf, nil
}
