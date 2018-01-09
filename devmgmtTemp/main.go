package main

import (
    "log"
    "net/http"
    "github.com/gorilla/mux"
    "devmgmtv2/auth"
    "devmgmtv2/ssid"
    "github.com/gorilla/handlers"
)

func main(){
    router := mux.NewRouter()
    auth.AuthInit(router)
    ssid.SsidInit(router)
    headersOk := handlers.AllowedHeaders([]string{"X-Requested-With"})
    originsOk := handlers.AllowedOrigins([]string{"*"})
    methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST","DELETE", "PUT", "OPTIONS"})

    log.Fatal(http.ListenAndServe(":8000",handlers.CORS(headersOk,originsOk,methodsOk)(router)))
    //log.Fatal(http.ListenAndServe(":8000",handlers.CORS()(router)))
}
