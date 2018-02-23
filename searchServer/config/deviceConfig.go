package config

import (
	"encoding/json"
	"io/ioutil"
	"log"
)

type DeviceConfig struct {
	deviceConfigJson DeviceConfigJson
	ActiveProfile    DeviceInfo
	Logger           *Tracelog
}

var DevConfig *DeviceConfig

type DeviceInfo struct {
	AcceptedExtensions  []string `json:"accepted_extensions"`   // .ecar
	CdnURL              string   `json:"cdn_url"`               // http://cdn.pinut.com
	CdnScriptsURL       string   `json:"cdn_scripts_url"`       // /opt/opencdn/CDN
	ConfigJsonDir       string   `json:"config_json_dir"`       // /var/www/ekstep/config_json/
	ConfigJsonName      string   `json:"config_json_name"`      // config.json
	ContentRoot         string   `json:"content_root"`          // /var/www/ekstep/ecar_files/
	JsonDir             string   `json:"json_dir"`              // /var/www/ekstep/json_dir/
	MediaRoot           string   `json:"media_root"`            // /var/www/ekstep/
	ProfileName         string   `json:"profile_name"`          // ekstep
	ServerRoot          string   `json:"server_root"`           // /home/pi/usb-backend-pinut/file_upload/
	Telemetry           string   `json:"telemetry"`             // /var/www/ekstep/telemetry/
	UnzipContent        string   `json:"unzip_content"`         // /var/www/ekstep/content/
	UnzipContentdirName string   `json:"unzip_contentdir_name"` // /var/www/ekstep/content/
	UsbOnAutomount      string   `json:"usb_on_automount"`      // /media/
	UsbDir              string   `json:"usb_dir"`               // ecar_files
}

type DeviceConfigJson struct {
	ActiveProfileName string                `json:"active_profile"`     // ekstep
	AvailableProfiles map[string]DeviceInfo `json:"available_profiles"` // ekstep
}

func DeviceConfigLoad() *DeviceConfig {
	var ch DeviceConfig
	//	var configfile = flags.Configfile
	var configfile = "/opt/opencdn/CDN/profile.json"

	raw, err := ioutil.ReadFile(configfile)
	if err != nil {
		log.Fatalf("Error opening device config JSON file: %v", err)
		return &ch
	}

	dcj := ch.deviceConfigJson
	err = json.Unmarshal(raw, &dcj)
	if err != nil {
		log.Fatalf("Invalid format device config JSON file: %v", err)
		return &ch
	}
	pn := dcj.ActiveProfileName
	profiles := dcj.AvailableProfiles

	for k, v := range profiles {
		if k == pn {
			ch.ActiveProfile = v
		}
	}

	return &ch
}

func DeviceConfigInit() {
	DevConfig = DeviceConfigLoad()
	logfile := DevConfig.ActiveProfile.MediaRoot + "searchServer.log"
	DevConfig.Logger = LoggerInit(logfile)
}

func DeviceConfigGet() *DeviceConfig {
	return DevConfig
}

func DeviceConfigJsonAbsFile() *string {
	if DevConfig == nil {
		return nil
	}
	af := DevConfig.ActiveProfile.ConfigJsonDir + DevConfig.ActiveProfile.ConfigJsonName
	return &af
}

func DeviceConfigJsonDirPath() *string {
	if DevConfig == nil {
		return nil
	}
	return (&DevConfig.ActiveProfile.ConfigJsonDir)
}

func DeviceDataJsonDirPath() *string {
	if DevConfig == nil {
		return nil
	}
	return (&DevConfig.ActiveProfile.JsonDir)
}

func (dc *DeviceConfig) CdnURL() string {
	return dc.ActiveProfile.CdnURL
}

func (dc *DeviceConfig) ContentRootPath() string {
	return dc.ActiveProfile.ContentRoot
}

func (dc *DeviceConfig) UnzipContentdirName() string {
	return dc.ActiveProfile.UnzipContentdirName
}

func DeviceProfileTelemetryDir() string {
	if DevConfig == nil {
		return "/tmp/"
	}
	return (DevConfig.ActiveProfile.Telemetry)
}

func (dc *DeviceConfig) ConfigJsonAbsFilename() string {
	af := dc.ActiveProfile.ConfigJsonDir + dc.ActiveProfile.ConfigJsonName
	log.Printf("config file abs: %s\n", af)
	return af
}
