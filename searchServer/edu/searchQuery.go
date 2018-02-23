package edu

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/blevesearch/bleve"
	//	"github.com/blevesearch/bleve/query"
	"github.com/blevesearch/bleve/search/query"
)

/***
type SearchRequest struct {
    Query            query.Query       `json:"query"`
    Size             int               `json:"size"`
    From             int               `json:"from"`
    Highlight        *HighlightRequest `json:"highlight"`
    Fields           []string          `json:"fields"`
    Facets           FacetsRequest     `json:"facets"`
    Explain          bool              `json:"explain"`
    Sort             search.SortOrder  `json:"sort"`
    IncludeLocations bool              `json:"includeLocations"`
}

A SearchRequest describes all the parameters needed to search the index. Query is required.
 Size/From describe how much and which part of the result set to return.
 Highlight describes optional search result highlighting.
 Fields describes a list of field values which should be retrieved for result documents,
 provided they were stored while indexing. Facets describe the set of facets to be computed.
 Explain triggers inclusion of additional search result score explanations.
 Sort describes the desired order for the results to be returned.

A special field named "*" can be used to return all fields.


type SearchResult struct {
    Status   *SearchStatus                  `json:"status"`
    Request  *SearchRequest                 `json:"request"`
    Hits     search.DocumentMatchCollection `json:"hits"`
    Total    uint64                         `json:"total_hits"`
    MaxScore float64                        `json:"max_score"`
    Took     time.Duration                  `json:"took"`
    Facets   search.FacetResults            `json:"facets"`
}

***/

//func SearchQueryByEcarManifestItemsIdentifier(ids []string) (string, error) {
func SearchEcarByIdentifier(ids []string) (EcarManifestArchiveItems, error) {

	log.Println("Search by ID called...")
	index := *ekstepIndexGet()
	//Build a query for exact match of identifier

	log.Println(ids)
	query := bleve.NewDocIDQuery(ids)
	//query := bleve.NewMatchQuery("lesson")
	//query := bleve.NewMatchAllQuery()
	searchRequest := bleve.NewSearchRequest(query)
	searchRequest.Size = 36
	log.Println(searchRequest)
	//searchResult, _ := EkstepIndex.Search(searchRequest)
	searchResult, _ := index.Search(searchRequest)
	log.Println(searchResult)

	//OriginalDocs := getOriginalDocsFromSearchResults(searchResult, EkstepIndex)
	OriginalDocs, err := getOriginalDocsFromSearchResults(searchResult, index)

	if err != nil {
		log.Println("Trouble retrieving original docs from search!")
	}

	//	fmt.Println("Original document retrived from Index.GetInternal is:\n")
	//	fmt.Printf("%s\n", OriginalDocs[0])

	//return toJson(searchResult), nil
	return OriginalDocs[0], nil
}

func getOriginalDocsFromSearchResults(
	results *bleve.SearchResult,
	index bleve.Index,
) ([]EcarManifestArchiveItems, error) {

	var err error
	//docs := make([][]byte, 0)
	docs := make([]EcarManifestArchiveItems, 0)

	for _, val := range results.Hits {
		id := val.ID
		raw, err := index.GetInternal([]byte(id))
		if err != nil {
			log.Printf("Trouble getting internal doc: %v", err)
			return docs, err
		}

		var jsonDoc EcarManifestArchiveItems
		//	var jsonDoc map[string]*json.RawMessage
		err = json.Unmarshal(raw, &jsonDoc)
		//var items EcarManifestArchiveItems
		//  err = json.Unmarshal(*jsonDoc["archive"], &items)
		//  raw2, err := json.Marshal(jsonDoc.Archive.Items)

		//docs = append(docs, raw)
		docs = append(docs, jsonDoc)
	}
	return docs, err
}

/***
NewConjunctionQuery creates a new compound Query. Result documents must satisfy all of the queries.

Example(NewConjunctionQuery)
Code:

conjunct1 := NewMatchQuery("great")
conjunct2 := NewMatchQuery("one")
query := NewConjunctionQuery(conjunct1, conjunct2)
searchRequest := NewSearchRequest(query)
searchResults, err := exampleIndex.Search(searchRequest)
if err != nil {
    panic(err)
}

fmt.Println(searchResults.Hits[0].ID)
Output:

document id 2
***/

func SearchStandardQuery(request *CommonUtilPageSectionsSearch) ([]EcarManifestArchiveItems, error) {

	index := *ekstepIndexGet()

	mf := &request.Filters
	queryStr := request.Query

	log.Println(toJson(mf))

	// Supported filters: identifier, gradeLevel, medium, board, contentType & subject
	// Build a query for exact match of identifier.
	// If present, don't look at any other filters

	finalQ := bleve.NewBooleanQuery()

	//Parse: Create a Must query if searched for 'query'
	if len(queryStr) > 0 {
		log.Printf("Processing query string: %s", queryStr)
		q := bleve.NewMatchQuery(queryStr)
		//Add into the 'should' clause of the final Query
		finalQ.AddMust(q)
	} // if len(queryStr) > 0

	//Add all filter queries
	finalQ, _ = SearchFilterQueryAdd(mf, finalQ)

	searchRequest := bleve.NewSearchRequest(finalQ)
	log.Println(searchRequest)
	searchResult, _ := index.Search(searchRequest)
	log.Println(searchResult)

	OriginalDocs, _ := getOriginalDocsFromSearchResults(searchResult, index)
	log.Printf("Total Doc rectrived: %d\n", len(OriginalDocs))

	//fmt.Println("Original document retrieved from Index.GetInternal is:\n")
	//fmt.Printf("%s\n", OriginalDocs)

	//return toJson(searchResult), nil
	return OriginalDocs, nil
}

func SearchContentHomePageSection(section *ContentHomeUtilPageSections, request *ContentHomeRequestRequest) ([]EcarManifestArchiveItems, error) {
	index := *ekstepIndexGet()

	//Merge both the filters from config and incoming request
	sizeLimit := section.Search.Limit
	log.Printf("in SearchContentHomePageSection, limit: %d\n", sizeLimit)

	cf := &section.Search.Filters
	rf := &request.Filters

	mf, err := mergeFilters(cf, rf)
	if err != nil {
		log.Println("Error in merging data structures...")
	}

	//	log.Println(toJson(mf))

	// Supported filters: identifier, gradeLevel, medium, board, contentType & subject
	// Build a query for exact match of identifier.
	// If present, don't look at any other filters

	finalQ := bleve.NewBooleanQuery()

	finalQ, _ = SearchFilterQueryAdd(mf, finalQ)

	searchRequest := bleve.NewSearchRequest(finalQ)
	if sizeLimit > 0 {
		searchRequest.Size = sizeLimit
	}

	//query := bleve.NewMatchAllQuery()
	//	searchRequest := bleve.NewSearchRequest(should1)
	//	searchRequest.Size = 36
	log.Println(searchRequest)
	searchResult, _ := index.Search(searchRequest)
	log.Println(searchResult)

	OriginalDocs, _ := getOriginalDocsFromSearchResults(searchResult, index)
	log.Printf("Total Doc rectrived: %d\n", len(OriginalDocs))

	fmt.Println("section: Original document retrieved from Index.GetInternal is:\n")
	fmt.Printf("%s\n", OriginalDocs)

	//return toJson(searchResult), nil
	return OriginalDocs, nil
}

func SearchFilterQueryAdd(filter *CommonUtilFilters, boolQ *query.BooleanQuery) (*query.BooleanQuery, error) {

	// Supported filters: identifier, gradeLevel, medium, board, contentType & subject
	// Build a query for exact match of identifier.
	// If present, don't look at any other filters

	//Parse: Create a Disjunction query for all the fields of identifier(list)
	if len(filter.Identifier) > 0 {
		djQ := bleve.NewDocIDQuery(filter.Identifier)
		boolQ.AddMust(djQ)
		return boolQ, nil
	} // if len(filter.Identifier) > 0

	/*

		//Parse: Create a Disjunction query for all the fields of identifier(list)
		if len(filter.Identifier) > 0 {
			djQ := bleve.NewDisjunctionQuery()
			for _, v := range filter.Identifier {
				log.Printf("Processing identifier filter: %s", v)
				q := bleve.NewMatchQuery(v)
				q.SetField("identifier")
				djQ.AddQuery(q)
			}

			boolQ.AddMust(djQ)
			//TODO:need optimization
			//return only "visibility": "Default" documents
			//Add into the 'must' clause of the final Query

			t := bleve.NewMatchQuery("Default")
			t.SetField("visibility")
			boolQ.AddMust(t)

			return boolQ, nil
		} // if len(filter.Identifier) > 0
	*/

	//Parse: Create a Disjunction query for all the fields of contentType(list)
	if len(filter.ContentType) > 0 {
		log.Printf("Processing contentType filter; total: %d", len(filter.ContentType))
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range filter.ContentType {
			q := bleve.NewMatchQuery(v)
			q.SetField("contentType")
			// fmt.Printf("%T", v)
			djQ.AddQuery(q)
		}
		//Add into the 'must' clause of the final Query
		boolQ.AddMust(djQ)
	} // if len(filter.ContentType) > 0

	//Parse: Create a Disjunction query for all the fields of subject(list)
	if len(filter.Subject) > 0 {
		log.Printf("Processing subject filter; total: %d", len(filter.Subject))
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range filter.Subject {
			q := bleve.NewMatchQuery(v)
			q.SetField("subject")
			djQ.AddQuery(q)
		}
		//Add into the 'must' clause of the final Query
		boolQ.AddMust(djQ)
	} // if len(filter.Subject) > 0

	//Parse: Create a Disjunction query for all the fields of gradeLevel(list)
	if len(filter.GradeLevel) > 0 {
		log.Printf("Processing gradelevel filter; total: %d", len(filter.GradeLevel))
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range filter.GradeLevel {
			q := bleve.NewMatchQuery(v)
			q.SetField("gradeLevel")
			// fmt.Printf("%T", v)
			djQ.AddQuery(q)
		}
		//Add into the 'should' clause of the final Query
		boolQ.AddShould(djQ)
	} // if len(filter.GradeLevel) > 0

	//Parse: Create a Disjunction query for all the fields of medium(list)
	if len(filter.Medium) > 0 {
		log.Printf("Processing medium filter; total: %d", len(filter.Medium))
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range filter.Medium {
			q := bleve.NewMatchQuery(v)
			q.SetField("medium")
			// fmt.Printf("%T", v)
			djQ.AddQuery(q)
		}
		//Add into the 'should' clause of the final Query
		boolQ.AddShould(djQ)
	} // if len(filter.Medium) > 0

	//Parse: Create a Disjunction query for all the fields of board(list)
	if len(filter.Board) > 0 {
		log.Printf("Processing board filter; total: %d", len(filter.Board))
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range filter.Board {
			q := bleve.NewMatchQuery(v)
			q.SetField("board")
			// fmt.Printf("%T", v)
			djQ.AddQuery(q)
		}
		//Add into the 'should' clause of the final Query
		boolQ.AddShould(djQ)
	} // if len(filter.Board) > 0

	return boolQ, nil
}

func SearchContentHomePageSectionbak(section *ContentHomeUtilPageSections, request *ContentHomeRequestRequest) ([]EcarManifestArchiveItems, error) {
	index := *ekstepIndexGet()
	//Merge both the filters from config and incoming request
	sizeLimit := section.Search.Limit
	log.Printf("in SearchContentHomePageSection, limit: %d\n", sizeLimit)

	cf := &section.Search.Filters
	rf := &request.Filters

	mf, err := mergeFilters(cf, rf)
	if err != nil {
		log.Println("Error in merging data structures...")
	}

	//	log.Println(toJson(mf))

	// Supported filters: identifier, gradeLevel, medium, board, contentType & subject
	// Build a query for exact match of identifier.
	// If present, don't look at any other filters

	finalQ := bleve.NewBooleanQuery()

	//Parse: Create a Disjunction query for all the fields of identifier(list)
	if len(mf.Identifier) > 0 {
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range mf.Identifier {
			log.Printf("Processing identifier filter: %s", v)
			q := bleve.NewMatchQuery(v)
			q.SetField("identifier")
			djQ.AddQuery(q)
		}
		//Add into the 'must' clause of the final Query
		finalQ.AddMust(djQ)
		goto makeSearchRequest // GOTO !
	} // if len(mf.Identifier) > 0

	//Parse: Create a Disjunction query for all the fields of subject(list)
	if len(mf.Subject) > 0 {
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range mf.Subject {
			log.Printf("Processing subject filter: %s", v)
			q := bleve.NewMatchQuery(v)
			q.SetField("subject")
			djQ.AddQuery(q)
		}
		//Add into the 'must' clause of the final Query
		finalQ.AddMust(djQ)
	} // if len(mf.Subject) > 0

	//Parse: Create a Disjunction query for all the fields of gradeLevel(list)
	if len(mf.GradeLevel) > 0 {
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range mf.GradeLevel {
			log.Printf("Processing gradeLevel filter: %s", v)
			q := bleve.NewMatchQuery(v)
			q.SetField("gradeLevel")
			// fmt.Printf("%T", v)
			djQ.AddQuery(q)
		}
		//Add into the 'should' clause of the final Query
		finalQ.AddShould(djQ)
	} // if len(mf.GradeLevel) > 0

	//Parse: Create a Disjunction query for all the fields of medium(list)
	if len(mf.Medium) > 0 {
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range mf.Medium {
			log.Printf("Processing medium filter: %s", v)
			q := bleve.NewMatchQuery(v)
			q.SetField("medium")
			// fmt.Printf("%T", v)
			djQ.AddQuery(q)
		}
		//Add into the 'should' clause of the final Query
		finalQ.AddShould(djQ)
	} // if len(mf.Medium) > 0

	//Parse: Create a Disjunction query for all the fields of board(list)
	if len(mf.Board) > 0 {
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range mf.Board {
			log.Printf("Processing board filter: %s", v)
			q := bleve.NewMatchQuery(v)
			q.SetField("board")
			// fmt.Printf("%T", v)
			djQ.AddQuery(q)
		}
		//Add into the 'should' clause of the final Query
		finalQ.AddShould(djQ)
	} // if len(mf.Board) > 0

	//Parse: Create a Disjunction query for all the fields of contentType(list)
	if len(mf.ContentType) > 0 {
		djQ := bleve.NewDisjunctionQuery()
		for _, v := range mf.ContentType {
			log.Printf("Processing contentType filter: %s", v)
			q := bleve.NewMatchQuery(v)
			q.SetField("contentType")
			// fmt.Printf("%T", v)
			djQ.AddQuery(q)
		}
		//Add into the 'should' clause of the final Query
		finalQ.AddShould(djQ)
	} // if len(mf.ContentType) > 0

makeSearchRequest: // GOTO !

	//	searchRequest := bleve.NewSearchRequest(q1)
	searchRequest := bleve.NewSearchRequest(finalQ)
	if sizeLimit > 0 {
		searchRequest.Size = sizeLimit
	}

	//query := bleve.NewMatchAllQuery()
	//	searchRequest := bleve.NewSearchRequest(should1)
	//	searchRequest.Size = 36
	log.Println(searchRequest)
	searchResult, _ := index.Search(searchRequest)
	log.Println(searchResult)

	OriginalDocs, _ := getOriginalDocsFromSearchResults(searchResult, index)
	log.Printf("Total Doc received: %d\n", len(OriginalDocs))

	//	fmt.Println("Original document retrieved from Index.GetInternal is:\n")
	//	fmt.Printf("%s\n", OriginalDocs)

	//return toJson(searchResult), nil
	return OriginalDocs, nil
}
