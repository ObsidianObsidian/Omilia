package controller

import "net/http"

var Mux = http.NewServeMux()

func Setup() {
	go http.ListenAndServe(":5000", Mux)
}
