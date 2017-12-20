package main

import (
    "log"
    "net/http"
    "github.com/gorilla/mux"
    "devmgmtv2/auth"
    "devmgmtv2/ssid"
)

func main(){
    router := mux.NewRouter()
    auth.AuthInit(router)
    ssid.SsidInit(router)
    log.Fatal(http.ListenAndServe(":8000",router))
}
