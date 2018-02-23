package edu

import (
	"encoding/json"
	_ "expvar"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/blevesearch/bleve"
	"github.com/blevesearch/bleve/analysis/analyzer/keyword"
	"github.com/blevesearch/bleve/analysis/lang/en"
	"github.com/blevesearch/bleve/mapping"
)

var (
	batchSize   int = 100
	EkstepIndex *bleve.Index
)

func ekstepIndexGet() *bleve.Index {
	return EkstepIndex
}

func buildIndexMapping() (mapping.IndexMapping, error) {

	ecarItemsMapping := bleve.NewDocumentMapping()

	// a generic reusable mapping for keyword text
	keywordFieldMapping := bleve.NewTextFieldMapping()
	keywordFieldMapping.Analyzer = keyword.Name

	// a generic reusable mapping for english text
	englishTextFieldMapping := bleve.NewTextFieldMapping()
	englishTextFieldMapping.Analyzer = en.AnalyzerName

	// identifier
	ecarItemsMapping.AddFieldMappingsAt("identifier", keywordFieldMapping)

	// contentType
	//ecarItemsMapping.AddFieldMappingsAt("contentType", keywordFieldMapping)
	ecarItemsMapping.AddFieldMappingsAt("contentType", englishTextFieldMapping)

	// gradeLevel (TODO: check)
	ecarItemsMapping.AddFieldMappingsAt("gradeLevel", keywordFieldMapping)

	// board
	ecarItemsMapping.AddFieldMappingsAt("board", keywordFieldMapping)

	// description
	ecarItemsMapping.AddFieldMappingsAt("description",
		englishTextFieldMapping)

	// Create the index mapping
	indexMapping := bleve.NewIndexMapping()
	indexMapping.AddDocumentMapping("ecarItems", ecarItemsMapping)

	indexMapping.TypeField = "type"
	indexMapping.DefaultAnalyzer = "en"

	return indexMapping, nil
}

func ekstepIndexDelete(indexPath, indexName string) {

	index := ekstepIndexGet()
	if index != nil {
		err := (*index).Close()
		if err != nil {
			logger.Error.Printf("Error closing ekstep index: %v\n", err)
		}
		return
	}
	return
}

/* If index doesn't exist, create it */
func EcarDbIndexCreate(indexPath string) (*bleve.Index, error) {
	logger.Trace.Printf("Creating new index: %s", indexPath)
	// create a mapping
	mapping, err := buildIndexMapping()
	if err != nil {
		logger.Error.Fatalf("Mapping creation failed: %s %v", indexPath, err)
		return nil, err
	}

	/*
		//In memory db
		index, err = bleve.NewUsing("", mapping, bleve.Config.DefaultIndexType,
			bleve.Config.DefaultMemKVStore, nil)
	*/

	index, err := bleve.New(indexPath, mapping)
	if err != nil {
		logger.Error.Fatalf("Index creation failed: %s %v", indexPath, err)
	}

	return &index, err
}

func eduSearchInit(dbDir, indexName, jsonDir string) {
	indexPath := dbDir + string(os.PathSeparator) + indexName

	logger.Trace.Printf("Initializing searchEngine; index: %s", indexPath)

	//FIXME: DELETE the old index, so that db can be built on every reboot
	os.RemoveAll(indexPath)

	// open the index, if available
	index, err := bleve.Open(indexPath)
	if err == nil {
		EkstepIndex = &index
		logger.Trace.Printf("Opening existing index: %s", indexPath)
		return
	}

	if err == bleve.ErrorIndexPathDoesNotExist {
		EkstepIndex, err = EcarDbIndexCreate(indexPath)
	}
	// index data in the background
	//go func()
	func() {
		err = EcarDbIndexAddJsonDir(EkstepIndex, jsonDir)
		if err != nil {
			logger.Error.Fatal(err)
		}
	}()
}

func UpdateManifestUrl(item *EcarManifestArchiveItems, jsonFileName string, urlStr *string, content_dir_name string) error {
	if item == nil {
		return nil
	}
	// Add Url to appIcon, artifactUrl, downloadUrl, posterImage
	//urlStr := config.DeviceConfigCdnURL()

	//Filenames are like abc.ecar.json
	ecarFileName := strings.TrimSuffix(jsonFileName, filepath.Ext(jsonFileName))

	if item.AppIcon != nil {
		*item.AppIcon = *urlStr + "/" + content_dir_name + "/" + *item.AppIcon
	}

	if item.ArtifactURL != nil {
		*item.ArtifactURL = *urlStr + "/" + content_dir_name + "/" + *item.ArtifactURL
	}

	if item.DownloadURL != nil {
		*item.DownloadURL = *urlStr + "/ecar_files/" + ecarFileName
	} else {
		dlStr := *urlStr + "/ecar_files/" + ecarFileName
		item.DownloadURL = &dlStr
	}

	if item.PosterImage != nil {
		*item.PosterImage = *urlStr + "/" + content_dir_name + "/" + *item.PosterImage
	}
	// TODO: FILL Variants
	return nil
}

/*
func UpdateManifestUrl(jsonDoc *EcarManifest, jsonFileName string) error {
	// Add Url to appIcon, artifactUrl, downloadUrl, posterImage
	// TODO: Do we need to add to s3Key??
	//urlStr := config.DeviceConfigCdnURL()

	//Filenames are like abc.ecar.json
	ecarFileName := strings.TrimSuffix(jsonFileName, filepath.Ext(jsonFileName))

	for _, items := range jsonDoc.Archive.Items {

		if items.AppIcon != nil {
			*items.AppIcon = *urlStr + "/" + content_dir_name + "/" + *items.AppIcon
		}

		if items.ArtifactURL != nil {
			*items.ArtifactURL = *urlStr + "/" + content_dir_name + "/" + *items.ArtifactURL
		}

		if items.DownloadURL != nil {
			*items.DownloadURL = *urlStr + "/ecar_files/" + ecarFileName
		} else {
			dlStr = *urlStr + "/ecar_files/" + ecarFileName
			items.DownloadURL = &dlStr
			//items.DownloadURL = *urlStr + "/ecar_files/" + ecarFileName
		}

		if items.PosterImage != nil {
			*items.PosterImage = *urlStr + "/" + content_dir_name + "/" + *items.PosterImage
		}
	}
	return nil
}
*/

func EcarDbIndexRemoveJsonFile(i *bleve.Index, jsonDir, filename string) error {

	index := *i
	absFileName := jsonDir + filename
	logger.Trace.Printf("Removing from Index: %s\n", absFileName)
	// read the bytes
	//jsonBytes, err := ioutil.ReadFile(jsonDir + "/" + filename)
	jsonBytes, err := ioutil.ReadFile(absFileName)
	if err != nil {
		log.Println(err)
		return err
	}
	// parse bytes as json
	var jsonDoc EcarManifest
	err = json.Unmarshal(jsonBytes, &jsonDoc)
	if err != nil {
		return err
	}

	for _, items := range jsonDoc.Archive.Items {
		docID := items.IDentifier
		index.Delete(docID)
		if err != nil {
			logger.Error.Printf("Unable to delete index for id: %s", docID)
		}
	}
	return nil
}

func EcarDbIndexAddJsonFile(i *bleve.Index, jsonDir, filename string) error {
	if i == nil {
		logger.Error.Printf("bleve index is null\n")
		return nil
	}

	urlStr := EkstepConfigGlobal.deviceConfig.CdnURL()
	content_dir_name := EkstepConfigGlobal.deviceConfig.UnzipContentdirName()

	index := *i
	// read the bytes
	absFileName := jsonDir + "/" + filename
	logger.Trace.Printf("Indexing: %s\n", absFileName)
	jsonBytes, err := ioutil.ReadFile(absFileName)
	if err != nil {
		log.Println(err)
		return err
	}
	// parse bytes as json
	var jsonDoc EcarManifest
	err = json.Unmarshal(jsonBytes, &jsonDoc)
	if err != nil {
		return err
	}

	//Before indexing, update the relative path to Urls
	//err = UpdateManifestUrl(&jsonDoc, filename)

	for _, items := range jsonDoc.Archive.Items {
		docID := items.IDentifier
		err = UpdateManifestUrl(&items, filename, &urlStr, content_dir_name)
		index.Index(docID, jsonDoc.Archive.Items)

		jsonBytes, err := json.Marshal(jsonDoc)
		err = index.SetInternal([]byte(docID), jsonBytes)
		//err = i.SetInternal([]byte(docID), jsonBytes)
		if err != nil {
			log.Printf("Trouble doing SetInternal! %v", err)
		}
	}

	return nil
}

func EcarDbIndexAddJsonDir(i *bleve.Index, jsonDir string) error {

	var docID string
	//var dlStr string
	index := *i

	// open the directory
	dirEntries, err := ioutil.ReadDir(jsonDir)
	if err != nil {
		return err
	}

	urlStr := EkstepConfigGlobal.deviceConfig.CdnURL()
	content_dir_name := EkstepConfigGlobal.deviceConfig.UnzipContentdirName()

	// walk the directory entries for indexing
	count := 0
	startTime := time.Now()
	batch := index.NewBatch()
	batchCount := 0

	for _, dirEntry := range dirEntries {
		filename := dirEntry.Name()
		logger.Trace.Printf("Bulk addition to Index: %s\n", filename)
		// read the bytes
		jsonBytes, err := ioutil.ReadFile(jsonDir + "/" + filename)
		if err != nil {
			return err
		}
		// parse bytes as json
		var jsonDoc EcarManifest
		err = json.Unmarshal(jsonBytes, &jsonDoc)
		if err != nil {
			return err
		}

		//Before indexing, update the relative path to Urls
		//err = UpdateManifestUrl(&jsonDoc, filename)
		//Filenames are like abc.ecar.json
		//ecarFileName := strings.TrimSuffix(filename, filepath.Ext(filename))

		for _, items := range jsonDoc.Archive.Items {
			docID = items.IDentifier
			visibility := items.Visibility
			logger.Trace.Printf("id: %s visibility: %s", docID, visibility)
			if visibility != "Default" {
				logger.Trace.Printf("Ignoring id: %s visibility: %s", docID, visibility)
				continue
			}
			err = UpdateManifestUrl(&items, filename, &urlStr, content_dir_name)

			//ext := filepath.Ext(filename)
			//docID := filename[:(len(filename) - len(ext))]
			//batch.Index(docID, jsonDoc)
			batch.Index(docID, jsonDoc.Archive.Items)
			batchCount++

			//jsonBytes, err := json.Marshal(jsonDoc)
			//err = index.SetInternal([]byte(docID), jsonBytes)

			jsonBytes, err := json.Marshal(items)
			err = index.SetInternal([]byte(docID), jsonBytes)
			if err != nil {
				logger.Error.Println("Trouble doing SetInternal!")
			}
			if batchCount >= batchSize {
				err = index.Batch(batch)
				if err != nil {
					return err
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

			break
		}
	}
	// flush the last batch
	if batchCount > 0 {
		err = index.Batch(batch)
		if err != nil {
			log.Fatal(err)
		}
	}
	indexDuration := time.Since(startTime)
	indexDurationSeconds := float64(indexDuration) / float64(time.Second)
	timePerDoc := float64(indexDuration) / float64(count)
	logger.Info.Printf("Indexed %d documents, in %.2fs (average %.2fms/doc)", count, indexDurationSeconds, timePerDoc/float64(time.Millisecond))
	return nil
}
