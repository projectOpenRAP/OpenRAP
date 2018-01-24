package upgrade

import (
    "fmt"
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
)

func UpgradeInit(router *mux.Router){
    registerRoutes(router)    
}

func registerRoutes(r *mux.Router){
    r.HandleFunc("/upgrade",Upgrade).Methods("POST")
}

func Upgrade(w http.ResponseWriter, r *http.Request){
    fmt.Fprintln(w,"welcome")
}
