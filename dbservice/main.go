package main

import (
    "fmt"
    "log"
    "net/http"
    "github.com/gorilla/mux"
    //"github.com/boltdb/bolt"
)

func main(){
    router := mux.NewRouter()
    registerRoutes(router)
    log.Fatal(http.ListenAndServe(":9001",router))
}

func registerRoutes(r *mux.Router){
    r.HandleFunc("/welcome",Welcome).Methods("GET")
}

func Welcome(w http.ResponseWriter, r *http.Request){
    fmt.Fprintln(w,"Welcome")
}
