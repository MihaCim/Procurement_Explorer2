package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"web-scraper/database"

	chr "github.com/chromedp/chromedp"
	"github.com/labstack/echo/v4"
)



type ScraperApiHandlers struct{}
type Entry struct {
	Name    string `json:"name"`
	Website string `json:"Website"`
}

type ScrapingEntry struct {
	Url    string `json:"Url"`	
}

type ScrapedResult struct {
	Url    string `json:"Url"`
	Title  string `json:"Website"`
	Data   string `json:"Data"`
}

func (t ScraperApiHandlers) Scrape(c echo.Context) error {
	fmt.Println("Scrape called")
	url := c.QueryParam("url")
	fmt.Println(url)
	
	options := append(chr.DefaultExecAllocatorOptions[:],
		chr.Flag("disable-logging", true),
		chr.UserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0"),
	)
	fmt.Println("Options set for Chrome Exec Allocator")

	ctx, _ := chr.NewExecAllocator(
		context.Background(),
		options...,
	)
	fmt.Println("Chrome Exec Allocator created")
	
	wCtx, cancel := chr.NewContext(ctx)
	wCtx, cancelTimeout := context.WithTimeout(wCtx, time.Duration(120)*time.Second)
	fmt.Println("New context created with timeout")

	var res string
	var title string
	err := chr.Run(wCtx, chr.Tasks{
		chr.Navigate(url),		
		chr.Text(`body`, &res),
		chr.Title(&title),
	})	
	
	cancel()
	cancelTimeout()
	fmt.Println(err)
	if err != nil {
		return c.NoContent(http.StatusNoContent)
	}

	scrapedResult := ScrapedResult{
		Url:  url,
		Title: title,
		Data:  res,
	}

	return c.JSON(http.StatusOK, scrapedResult)
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
