package main

import (
    "flag"
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

var db *bolt.DB
var DB_PATH = "/home/stuart/openRap/my.db"

func main(){
    httpPort := flag.String("port", "9001", "The port for http to run")
    flag.Parse()
    db = DbInit()
    router := mux.NewRouter()
    registerRoutes(router)
    log.Fatal(http.ListenAndServe(":"+*httpPort,router))
}

func DbInit() *bolt.DB {
    db,err := bolt.Open(DB_PATH, 0600,nil)
    if err != nil {
        log.Fatal(err)
    }
    return db
    //defer db.Close()

}

func registerRoutes(r *mux.Router){
    r.HandleFunc("/bucket",AddBucket).Methods("POST")
    r.HandleFunc("/entry",AddKeyValue).Methods("POST")
    r.HandleFunc("/{bucket}/{key}",GetKeyValue).Methods("GET")
}

// Unused, to be used in future
func AddBucket(w http.ResponseWriter, r *http.Request){
    err := db.Update(func(tx *bolt.Tx) error {
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
    err := db.Update(func(tx *bolt.Tx) error {
        b,err := tx.CreateBucketIfNotExists([]byte(keyValue.Bucket))
        if err != nil {
            //log.Fatal(err)
            return err
        }
        err = b.Put([]byte(keyValue.Key), []byte(keyValue.Value))
        return err
    })
    if err != nil {
        //log.Fatal(err)
        fmt.Println(err)
    }
    w.Header().Set("Content-Type", "text/plain")
    w.Write([]byte("Value Created Successfully!!!"))

}
func GetKeyValue(w http.ResponseWriter, r *http.Request){
    vars := mux.Vars(r)
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

