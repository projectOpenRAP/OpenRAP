package ssid

import (
    "encoding/json"
    "github.com/gorilla/mux"
    //"io/ioutil"
    "fmt"
    "net/http"
)

type Ssid struct{
    Ssid string `json:"ssid,omitempty"`
    Host string `json:"host,omitempty"`
    Password string `json:"passowrd,omitempty"`
}

func SsidInit(router *mux.Router){
    registerRoutes(router)
}
func GetPeople(w http.ResponseWriter, r *http.Request){
    fmt.Fprintln(w,"Welcome")
}

func registerRoutes(r *mux.Router){

    r.HandleFunc("/people",GetPeople).Methods("GET")
    r.HandleFunc("/ssid", GetSsid).Methods("GET")
    r.HandleFunc("/ssid/update", UpdateSsid).Methods("POST");
}

func GetSsid(w http.ResponseWriter, r *http.Request){
    //TODO get ssid
    //TODO create struct
    //TODO respond back
    ssid := Ssid{"AP","",""}
    json.NewEncoder(w).Encode(ssid)
}

func UpdateSsid(w http.ResponseWriter, r *http.Request){
    var ssid Ssid
    json.NewDecoder(r.Body).Decode(&ssid)
    fmt.Println(ssid)
    json.NewEncoder(w).Encode(ssid)

}
