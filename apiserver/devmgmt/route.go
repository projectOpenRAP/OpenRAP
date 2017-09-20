package devmgmt

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

var routes map[string]http.HandlerFunc = map[string]http.HandlerFunc{
	"/api/devmgmt/v1/system/reboot": sysRebootHandler,
	"/api/devmgmt/v1/system/bssid":  sysBSSIDHandler,
}

func sysRebootHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Rebooting the System...")
}

func sysBSSIDHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "BSSID handler called...")
}

func RegisterRoute(router *mux.Router) {
	for route, handler := range routes {
		//	    fmt.Printf("Registering route[%s] with handler[%s]", route, handler)
		router.HandleFunc(route, handler)
	}

	fmt.Println("Registered route for devmgmt api")
}
