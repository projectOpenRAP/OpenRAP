package auth

import (
    "encoding/json"
    "fmt"
    "bytes"
    "io/ioutil"
    "github.com/gorilla/mux"
    "net/http"
)

type User struct{
    User string `json:"user,omitempty"`
    Password string `json:"password,omitempty"`
}

type DBObject struct{
    Bucket string `json:"bucket,omitempty"`
    Key string `json:"key,omitempty"`
    Value string `json:"value,omitempty"`
}

func AuthInit(router *mux.Router){
    registerRoutes(router)
}

func registerRoutes(r *mux.Router){
    r.HandleFunc("/auth/login", Login).Methods("POST","OPTIONS")
    r.HandleFunc("/auth/user", CreateUser).Methods("POST")
    r.HandleFunc("/auth/user", UpdateUser).Methods("PUT")
    r.HandleFunc("/auth/user",DeleteUser).Methods("DELETE")
    r.HandleFunc("/auth/user/list",GetUserList).Methods("GET")
}

func getUserPassword(u string) string {
    res,err := http.Get("http://localhost:9001/DEV_MGMT_USER/"+u)
    if err != nil {
        fmt.Println(err)
        return ""
    }
    defer res.Body.Close()
    bodyBytes,err := ioutil.ReadAll(res.Body)
    if err != nil {
        fmt.Println(err)
        return ""
    }
    fmt.Println(string(bodyBytes))
    return string(bodyBytes)
}

func DeleteUser(w http.ResponseWriter, r *http.Request){

    var user User
    json.NewDecoder(r.Body).Decode(&user)
    req,err := http.NewRequest("DELETE",url,,nil)
    if err != nil{
        fmt.Println(err)
    }
    res,err := http.DefaultClient.Do(req)
    if err != nil{
        fmt.Println(err)
    }
    bodyBytes, err := ioutil.ReadAll(res.Body)
    if err != nil{
        fmt.Println(err)
    }
    w.Header().Set("Content-Type", "text/plain")
    w.Write(bodyBytes)

}

func GetUserList(w http.ResponseWriter, r *http.Request){
    res,err := http.Get("http://localhost:9001/DEV_MGMT_USER/"+u)
    if err != nil {
        fmt.Println(err)
        return ""
    }
    defer res.Body.Close()
    bodyBytes,err := ioutil.ReadAll(res.Body)
    if err != nil {
        fmt.Println(err)
        return ""
    }
    w.Header().Set("Content-Type", "text/plain")
    w.Write(bodyBytes)
    //fmt.Println(string(bodyBytes))
    //return string(bodyBytes)
}

func Login(w http.ResponseWriter, r *http.Request){
    var user User
    json.NewDecoder(r.Body).Decode(&user)
    userPassword := getUserPassword(user.User)
    if user.Password == userPassword {
        w.Header().Set("Content-Type","text/plain")
        w.Write([]byte("success"))
    }else{
        http.Error(w,"Forbidden",http.StatusForbidden)
    }
}
func CreateUser(w http.ResponseWriter, r *http.Request){
    //Parse the body
    //create structure
    // save to db
    var user User
    var dbObj DBObject
    json.NewDecoder(r.Body).Decode(&user)
    fmt.Println(user)
    dbObj.Bucket = "DEV_MGMT_USER"
    dbObj.Key = user.User
    dbObj.Value = user.Password
    b,err := json.Marshal(dbObj)
    if err != nil {
        fmt.Println(err)
    }
    fmt.Println(string(b))
    body := []byte(string(b))
    rs,err := http.Post("http://localhost:9001/entry","application/json",bytes.NewBuffer(body))
    if err != nil {
        fmt.Println(err)
    }
    defer rs.Body.Close()
    bodyBytes,err := ioutil.ReadAll(rs.Body)
    if err!=nil{
        fmt.Println(err)
    }
    fmt.Println(string(bodyBytes))
}
func UpdateUser(w http.ResponseWriter, r *http.Request){
    // parse body
    // get result for that user
    // change values in db result if corresponding value is present in body
    // put data back to db 
}

