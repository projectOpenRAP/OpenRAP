package main

import (
    "encoding/json"
    "log"
    "net/http"
    "github.com/gorilla/mux"
    _ "devmgmtv2/captive_portal"
    "devmgmtv2/ssid"
)

type Person struct {
    ID string `json:"id,omitempty"`
    FirstName string `json:"firstname,omitempty"`
    LastName string `json:"lastname,omitempty"`
    Address *Address `json:"address,omitempty"`
}

type Address struct{
    City string `json:"city,omitempty"`
    State string `json:"state,omitempty"`
}

var people []Person


func GetPeople(w http.ResponseWriter, r *http.Request){
    json.NewEncoder(w).Encode(people)
}

func main(){
    people = append(people, Person{ID: "1", FirstName: "John", LastName: "Doe", Address: &Address{City: "City X", State: "State X"}})
    people = append(people, Person{ID: "2", FirstName: "Koko", LastName: "Doe", Address: &Address{City: "City Z", State: "State Y"}})
    people = append(people, Person{ID: "3", FirstName: "Francis", LastName: "Sunday"})
    router := mux.NewRouter()
    ssid.ssidinit(router)
    //router.HandleFunc("/people",GetPeople).Methods("GET")
    //router.HandleFunc("/people/{id}",GetPerson).Methods("GET")
    //router.HandleFunc("/people/{id}",CreatePerson).Methods("POST")
    //router.HandleFunc("/people/{id}",DeletePerson).Methods("DELETE")

    log.Fatal(http.ListenAndServe(":8000",router))
}
