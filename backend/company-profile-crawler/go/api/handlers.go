package main

import (
	"encoding/json"
	"net/http"
	"web-scraper/database"

	"github.com/labstack/echo/v4"
)

type ScraperApiHandlers struct{}
type Entry struct {
	Name    string `json:"name"`
	Website string `json:"Website"`
}

func (t ScraperApiHandlers) GetSites(c echo.Context) error {
	sites, err := database.GetSites()
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, sites)
}

func (t ScraperApiHandlers) AddSites(c echo.Context) error {
	body := GetJSONRawBody(c)
	if body != nil {
		newSites := []database.AddSite{}
		for _, v := range body {
			ent := Entry{}
			data, _ := json.Marshal(v)
			err := json.Unmarshal(data, &ent)
			if err != nil {
				c.String(500, err.Error())
			}

			s := database.AddSite{
				Name: ent.Name,
				Url:  ent.Website,
				Data: string(data),
			}
			newSites = append(newSites, s)
		}

		err := database.AddSites(newSites)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
		}
	}
	return c.NoContent(http.StatusNoContent)
}

func StartApi() {
	var scraperApi ScraperApiHandlers // This implements the scraper api interface
	e := echo.New()
	RegisterHandlers(e, scraperApi)

	// Start server
	e.Logger.Fatal(e.Start(":80"))
}

func GetJSONRawBody(c echo.Context) []interface{} {
	jsonBody := []interface{}{}
	err := json.NewDecoder(c.Request().Body).Decode(&jsonBody)
	if err != nil {
		return nil
	}

	return jsonBody
}
