package main

import (
    "encoding/json"
    "log"
    "net/http"
    "github.com/gorilla/mux"
    "devmgmtv2/ssid"
)

func main(){
    router := mux.NewRouter()
    ssid.SsidInit(router)
    log.Fatal(http.ListenAndServe(":8000",router))
}
