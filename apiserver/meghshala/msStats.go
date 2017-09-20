package meghshala

import (
	"encoding/json"
	"os"
)

type ContentStatsInfo struct {
	statsFile    *os.File
	contentStats *ContentStats
}

type TeachkitStats struct {
	ID            int64    `json:"id"`    // 3510
	Title         string   `json:"title"` // G6_S2_SCI_U13_L2_SPEED+AND+VELOCITY_ENGLISH
	TotalDownload int64    `json:"total_download"`
	DownloadedBy  []string `json:"downloaded_by"`
}

type ContentStats struct {
	TeachkitListStats []TeachkitStats `json:"coursekit"`
}

func teachkitStatsSave(cs *ContentStatsInfo) {
	// Truncate the current content to overwrite
	// TODO: Optimize
	cs.statsFile.Truncate(0)
	cs.statsFile.Seek(0, 0)

	jsonParser := json.NewEncoder(cs.statsFile)
	err := jsonParser.Encode(cs.contentStats)
	if err != nil {
		logger.Error.Printf("Unable to parse  stats JSON file: %v", err)
	}
}

func (cs *ContentStatsInfo) teachkitStatsAddAndSave(sessid string, docid int64, title string) {
	ts := cs.contentStats.TeachkitListStats
	s := TeachkitStats{}

	for idx, kit := range ts {
		if docid == kit.ID {
			//existing entry, just increment
			kit.TotalDownload++
			cs.contentStats.TeachkitListStats[idx].TotalDownload++
			cs.contentStats.TeachkitListStats[idx].DownloadedBy =
				append(cs.contentStats.TeachkitListStats[idx].DownloadedBy, sessid)
			goto saveStats
		}
	}
	//Not found, add a new entry
	s.ID = docid
	s.Title = title
	s.TotalDownload = 1
	s.DownloadedBy = append(s.DownloadedBy, sessid)
	ts = append(ts, s)
	cs.contentStats.TeachkitListStats = ts

saveStats:
	teachkitStatsSave(cs)
}

func (ms *MeghshalaConfig) ContentStatsInfoInit() {
	var ch ContentStatsInfo
	statsFile := ms.deviceConfig.ActiveProfile.MediaRoot + "stats.json"

	sf, err := os.OpenFile(statsFile, os.O_CREATE|os.O_RDWR, 0666)
	if err != nil {
		logger.Error.Println("cannot create stats file: ", err)
	}

	ch.statsFile = sf
	jsonParser := json.NewDecoder(sf)
	err = jsonParser.Decode(&ch.contentStats)
	if err != nil {
		ch.contentStats = &ContentStats{}
		logger.Error.Printf("Init: Unable to parse  stats JSON file: %v", err)
	}
	ms.contentStatsInfo = &ch
}
