package edu

import (
	_ "encoding/json"
	_ "fmt"
	_ "io/ioutil"
	_ "os"
	_ "time"
)

type EcarManifestArchiveItemsChildren struct {
	Description interface{} `json:"description"`
	IDentifier  string      `json:"identifier"` // do_30030595
	Index       float64     `json:"index"`      // 9.0
	Name        string      `json:"name"`       // PC Barahkhadi
	ObjectType  string      `json:"objectType"` // Content
	Relation    string      `json:"relation"`   // hasSequenceMember
}

type EcarManifestArchiveItemsVariants struct {
	Spine struct {
		EcarURL string  `json:"ecarUrl"`
		Size    float64 `json:"size"`
	} `json:"spine,omitempty"`
}
type EcarManifestArchiveItems struct {
	AgeGroup    []string `json:"ageGroup,omitempty"`    // 5-6
	AppIcon     *string  `json:"appIcon,omitempty"`     // do_20050809/2739a02c883a1ed624269674ee66ff8c_1476271391484.jpeg
	ArtifactURL *string  `json:"artifactUrl,omitempty"` // do_20051496/1476944125977_do_20051496.zip

	Children []EcarManifestArchiveItemsChildren `json:"children,omitempty"`

	Code               string  `json:"code,omitempty"`               // org.ekstep.literacy.game.2560
	CompatibilityLevel float64 `json:"compatibilityLevel,omitempty"` // 1
	ConsumerID         string  `json:"consumerId,omitempty"`
	ContentMetadata    struct {
		Virality struct {
			Origin        string  `json:"origin"`
			TransferCount float64 `json:"transferCount"`
		} `json:"virality,omitempty"`
	} `json:"contentMetadata,omitempty"`
	ContentType        string                            `json:"contentType,omitempty"` // Game
	ContentTypesCount  string                            `json:"contentTypesCount,omitempty"`
	Copyright          string                            `json:"copyright,omitempty"` //
	CreatedBy          string                            `json:"createdBy,omitempty"`
	CreatedOn          string                            `json:"createdOn,omitempty"`          // 2016-10-12T11:22:30.511+0000
	Creator            string                            `json:"creator,omitempty"`            // Debesh Rout
	Description        string                            `json:"description,omitempty"`        // Test lessonsTest lessons
	Developer          string                            `json:"developer,omitempty"`          // Ekstep
	Domain             []string                          `json:"domain,omitempty"`             // literacy
	DownloadURL        *string                           `json:"downloadUrl,omitempty"`        // <nil>
	EsMetadataID       string                            `json:"es_metadata_id"`               // do_20050809
	FlagReasons        interface{}                       `json:"flagReasons,omitempty"`        // <nil>
	GradeLevel         []string                          `json:"gradeLevel,omitempty"`         // Kindergarten
	IDealScreenDensity string                            `json:"idealScreenDensity,omitempty"` // hdpi
	IDealScreenSize    string                            `json:"idealScreenSize,omitempty"`    // normal
	IDentifier         string                            `json:"identifier"`                   // do_20050809
	Language           []string                          `json:"language,omitempty"`           // Assamese
	LastPublishedOn    string                            `json:"lastPublishedOn,omitempty"`    // 2016-10-12T11:24:28.018+0000
	LastSubmittedOn    string                            `json:"lastSubmittedOn,omitempty"`    // 2016-07-05T13:32:18.745+0000"
	LastPublishedBy    string                            `json:"lastPublishedBy,omitempty"`    // 582
	LastUpdatedBy      string                            `json:"lastUpdatedBy,omitempty"`      // Ekstep
	LastUpdatedOn      string                            `json:"lastUpdatedOn,omitempty"`      // 2016-10-12T11:24:28.156+0000
	License            string                            `json:"license,omitempty"`            // Creative Commons Attribution (CC BY)
	MediaType          string                            `json:"mediaType,omitempty"`          // content
	Medium             string                            `json:"medium,omitempty"`             // Oriya
	MimeType           string                            `json:"mimeType,omitempty"`           // application/vnd.android.package-archive
	Name               string                            `json:"name,omitempty"`               // game
	ObjectType         string                            `json:"objectType"`                   // Content
	Organization       []string                          `json:"organization,omitempty"`       //
	Os                 []string                          `json:"os,omitempty"`                 // All
	OsID               string                            `json:"osId,omitempty"`               // org.ekstep.quiz.app
	Owner              string                            `json:"owner,omitempty"`              // Mangesh Mane
	PkgVersion         float64                           `json:"pkgversion,omitempty"`         // 1.1
	PortalOwner        string                            `json:"portalOwner,omitempty"`        // EkStep
	PosterImage        *string                           `json:"posterImage,omitempty"`        // domain_4058/story4_1463738637957.png
	PrevState          string                            `json:"prevState,omitempty"`          // Review
	PublishError       interface{}                       `json:"publishError,omitempty"`       // <nil>
	Publisher          string                            `json:"publisher,omitempty"`          //
	S3Key              string                            `json:"s3Key,omitempty"`              // ecar_files/do_20050809_1476271467871.ecar
	Size               float64                           `json:"size,omitempty"`               // 10864
	Source             string                            `json:"source,omitempty"`             //
	Status             string                            `json:"status,omitempty"`             // Live
	Subject            string                            `json:"subject,omitempty"`            // domain
	Tags               []string                          `json:"tags,omitempty"`
	Template           string                            `json:"template,omitempty"` //
	Variants           *EcarManifestArchiveItemsVariants `json:"variants,omitempty"`
	VersionKey         string                            `json:"versionKey,omitempty"` // 1494534207770
	Visibility         string                            `json:"visibility,omitempty"` // Default
}

type EcarManifestArchive struct {
	Count int64                      `json:"count"` // 1
	Items []EcarManifestArchiveItems `json:"items"`
	Ttl   int64                      `json:"ttl"` // 24
}

type EcarManifest struct {
	ID      string              `json:"id"` // ekstep.content.archive
	Archive EcarManifestArchive `json:"archive"`
	Params  struct {
		Resmsgid string `json:"resmsgid"` // ec3cce5d-0acb-4eb1-8faf-c4684e1e71fc
	} `json:"params"`
	Ts string `json:"ts"` // 2016-10-12T11:24:31ZZ
	//Ver float64 `json:"ver,string"` // 1.1
	Ver string `json:"ver"` // 1.1
}

func (e *EcarManifestArchiveItems) Type() string {
	return "ecarItems"
}
