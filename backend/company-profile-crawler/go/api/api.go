// Package main provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/deepmap/oapi-codegen/v2 version v2.1.0 DO NOT EDIT.
package main

import (
	"github.com/labstack/echo/v4"
)

// Error defines model for Error.
type Error struct {
	Code    int32  `json:"code"`
	Message string `json:"message"`
}

// NewSites defines model for NewSites.
type NewSites = []string

// Site defines model for Site.
type Site struct {
	CreatedAt string `json:"created_at"`
	Progress  string `json:"progress"`
	Status    string `json:"status"`
	UpdatedAt string `json:"updated_at"`
	Url       string `json:"url"`
}

// Status defines model for Status.
type Status = []Site

// AddSitesJSONRequestBody defines body for AddSites for application/json ContentType.
type AddSitesJSONRequestBody = NewSites

// ServerInterface represents all server handlers.
type ServerInterface interface {

	// (GET /scrape)
	Scrape(ctx echo.Context) error

	// (GET /sites)
	GetSites(ctx echo.Context) error

	// (POST /sites)
	AddSites(ctx echo.Context) error
}

// ServerInterfaceWrapper converts echo contexts to parameters.
type ServerInterfaceWrapper struct {
	Handler ServerInterface
}

// Scrape converts echo context to params.
func (w *ServerInterfaceWrapper) Scrape(ctx echo.Context) error {
	var err error

	// Invoke the callback with all the unmarshaled arguments
	err = w.Handler.Scrape(ctx)
	return err
}

// GetSites converts echo context to params.
func (w *ServerInterfaceWrapper) GetSites(ctx echo.Context) error {
	var err error

	// Invoke the callback with all the unmarshaled arguments
	err = w.Handler.GetSites(ctx)
	return err
}

// AddSites converts echo context to params.
func (w *ServerInterfaceWrapper) AddSites(ctx echo.Context) error {
	var err error

	// Invoke the callback with all the unmarshaled arguments
	err = w.Handler.AddSites(ctx)
	return err
}

// This is a simple interface which specifies echo.Route addition functions which
// are present on both echo.Echo and echo.Group, since we want to allow using
// either of them for path registration
type EchoRouter interface {
	CONNECT(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	DELETE(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	GET(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	HEAD(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	OPTIONS(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	PATCH(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	POST(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	PUT(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	TRACE(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
}

// RegisterHandlers adds each server route to the EchoRouter.
func RegisterHandlers(router EchoRouter, si ServerInterface) {
	RegisterHandlersWithBaseURL(router, si, "")
}

// Registers handlers, and prepends BaseURL to the paths, so that the paths
// can be served under a prefix.
func RegisterHandlersWithBaseURL(router EchoRouter, si ServerInterface, baseURL string) {

	wrapper := ServerInterfaceWrapper{
		Handler: si,
	}

	router.GET(baseURL+"/sites", wrapper.GetSites)
	router.POST(baseURL+"/sites", wrapper.AddSites)
	router.GET(baseURL+"/scrape", wrapper.Scrape)

}
