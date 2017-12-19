package main

import (
    "fmt"
    "encoding/json"
    "log"
    "net/http"
    "github.com/gorilla/mux"
    "github.com/boltdb/bolt"
)

type KeyValue struct{
    Bucket string `json:"bucket,omitempty"`
    Key string `json:"key,omitempty"`
    Value string `json:"value,omitempty"`
}

func main(){
    router := mux.NewRouter()
    registerRoutes(router)
    log.Fatal(http.ListenAndServe(":9001",router))
}

func registerRoutes(r *mux.Router){
    r.HandleFunc("/welcome",Welcome).Methods("GET")
    r.HandleFunc("/create/bucket",AddBucket).Methods("POST")
    r.HandleFunc("/add/entry",AddKeyValue).Methods("POST")
    r.HandleFunc("/get/{bucket}/{key}",GetKeyValue).Methods("GET")
}

func Welcome(w http.ResponseWriter, r *http.Request){
    fmt.Fprintln(w,"Welcome")
}

func AddBucket(w http.ResponseWriter, r *http.Request){
    db,err := bolt.Open("my.db",0600,nil)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    err = db.Update(func(tx *bolt.Tx) error {
        _,err := tx.CreateBucketIfNotExists([]byte("MyBucket"))
        if err != nil {
            return err
        }
        return nil
    })
    if err != nil {
        log.Fatal(err)
        http.Error(w,"Error in creating Bucket",http.StatusInternalServerError)
    }
    w.Header().Set("Content-Type", "text/plain")
    w.Write([]byte("Bucket Created Successfully!!!"))
}
func AddKeyValue(w http.ResponseWriter, r *http.Request){
    var keyValue KeyValue
    json.NewDecoder(r.Body).Decode(&keyValue)
    fmt.Println(keyValue)
    db,err := bolt.Open("my.db",0600,nil)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    err = db.Update(func(tx *bolt.Tx) error {
        b,err := tx.CreateBucketIfNotExists([]byte(keyValue.Bucket))
        if err != nil {
            //log.Fatal(err)
            return err
        }
        err = b.Put([]byte(keyValue.Key), []byte(keyValue.Value))
        return err
    })
    if err != nil {
        log.Fatal(err)
    }
    w.Header().Set("Content-Type", "text/plain")
    w.Write([]byte("Value Created Successfully!!!"))

}
func GetKeyValue(w http.ResponseWriter, r *http.Request){
    vars := mux.Vars(r)
    db,err := bolt.Open("my.db",0600,nil)
    if err != nil {
        log.Fatal(err)
        http.Error(w,"Internal DB Error", http.StatusInternalServerError)
        return
    }
    defer db.Close()
    db.View(func(tx *bolt.Tx) error {
        bucket := tx.Bucket([]byte(vars["bucket"]))
        if bucket == nil {
            w.Header().Set("Content-Type", "text/plain")
            w.Write([]byte("No buckets found"))
            return nil
        }
        val := bucket.Get([]byte(vars["key"]))
        fmt.Println(val)
        fmt.Println(string(val))
        w.Header().Set("Content-Type", "text/plain")
        w.Write([]byte(string(val)))
        return nil
    })
}

