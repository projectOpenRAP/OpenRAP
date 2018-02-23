package edu

type ContentHomeUtilPageSectionsDisplay struct {
	Name struct {
		En string `json:"en"` // Best of Genie
		Hn string `json:"hn"` // लोकप्रिय कहानियां
	} `json:"name"`
}
type ContentHomeUtilPageSectionsRecommend struct {
	Context struct {
		ContentId string `json:"contentid"`
		Did       string `json:"did"`
		Dlang     string `json:"dlang"`
	} `json:"context"`
	Facets  []string           `json:"facets,omitempty"` // contentType
	Filters *CommonUtilFilters `json:"filters"`
	Limit   int                `json:"limit,omitempty"`
	SortBy  *CommonUtilSortBy  `json:"sort_by"`
}

type ContentHomeUtilPageSections struct {
	Display   ContentHomeUtilPageSectionsDisplay    `json:"display"`
	Recommend *ContentHomeUtilPageSectionsRecommend `json:"recommend"`
	//Recommend        ContentHomeUtilPageSectionsRecommend `json:"recommend,omitempty"`
	FilterModifiable bool                         `json:"filterModifiable"` // true
	Search           CommonUtilPageSectionsSearch `json:"search,omitempty"`
	//Contents         []ContentHomeUtilPageSectionsContents `json:"contents,omitempty"`
	Contents []EcarManifestArchiveItems `json:"contents,omitempty"`
	Apiid    string                     `json:"apiid,omitempty"` // ekstep.composite-search.search
}

type ContentHomeUtilPage struct {
	ID       string                        `json:"id"`                // org.ekstep.genie.content.home
	Banners  interface{}                   `json:"banners,omitempty"` // <nil>
	Sections []ContentHomeUtilPageSections `json:"sections"`
}
