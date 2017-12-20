package auth

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "github.com/gorilla/mux"
    "net/http"
)

type User struct{
    User string `json:"user,omitempty"`
    Password string `json:"password,omitempty"`
}

func AuthInit(router *mux.Router){
    
    registerRoutes(router)
}

func registerRoutes(r *mux.Router){
    r.HandleFunc("/auth/login", Login).Methods("POST")
    r.HandleFunc("/auth/welcome",Welcome).Methods("GET")
    r.HandleFunc("/auth/user", CreateUser).Methods("POST")
    r.HandleFunc("/auth/user", UpdateUser).Methods("PUT")
}

func Welcome(w http.ResponseWriter, r *http.Request){
    fmt.Fprintln(w,"Welcome")
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

func Login(w http.ResponseWriter, r *http.Request){
    //Create User Struct
    var user User
    json.NewDecoder(r.Body).Decode(&user)
    fmt.Println(user)
    userPassword := getUserPassword(user.User)
    // call get value for that user
    fmt.Println(userPassword)
    // check for equality if true, return the structure
    // if false return error
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
}
func UpdateUser(w http.ResponseWriter, r *http.Request){
    // parse body
    // get result for that user
    // change values in db result if corresponding value is present in body
    // put data back to db 
}

