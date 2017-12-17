package ssid

import (
    "github.com/gorilla/mux"
    "fmt"
    "net/http"
)

func ssidinit(router *mux.Router){
    registerRoutes(router)
}
func GetPeople(w http.ResponseWriter, r *http.Request){
    fmt.Fprintln(w,"Welcome")
}

func registerRoutes(r *mux.Router){
    r.HandleFunc("/people",GetPeople).Methods("GET")
}
