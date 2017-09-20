package main

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/projectOpenRAP/OpenRAP/apiserver/ekstep"
	"github.com/projectOpenRAP/OpenRAP/apiserver/meghshala"
)

func serve(profile string) {
	router := mux.NewRouter()

	switch profile {
	case "meghshala":
		//Register the meghshala module
		meghshala.MeghshalaInit(router)
	case "ekstep":
		//Register the ekstep module
		ekstep.EkstepInit(router)
	case "pinut":
		//Register the meghshala module
	//	pinut.PinutInit(router)
	default:
		//Error.Fatalf("Unsupported profile(%s)  in config.json\n", profile)
		logger.Error.Fatalf("Unsupported profile(%s)  in config.json\n", profile)
	}

	router.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir(dataDir))))

	server := &http.Server{
		Addr:    httpAddr,
		Handler: router,
	}

	logger.Info.Printf("%s: apiserver listening on: %s serving from: %s\n", profile, httpAddr, dataDir)
	server.ListenAndServe()
}
