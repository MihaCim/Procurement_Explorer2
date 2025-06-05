package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/url"
	"strings"
	"time"

	"web-scraper/database"

	"github.com/chromedp/cdproto/cdp"
	chr "github.com/chromedp/chromedp"
)

type (
	Output struct {
		Title   string `json:"title"`
		Url     string `json:"url"`
		Content string `json:"content"`
	}
)

func worker(ctx context.Context, id int, jobs <-chan database.Site) {
	for j := range jobs {

		if j.Url != "" {
			duplicate, err := database.DuplicateSite(j.Id, j.Url)
			if err != nil {
				log.Print("ERROR: worker ", id, " job id: ", j.Id, " ", j.Url, " Failed to find sites: ", err)
			}
			// Site was already processed, skip for now.
			if duplicate {
				log.Print("DEBUG: worker ", id, " job id: ", j.Id, " ", j.Url, " DUPLICATE SITE SKIPPING")
				continue
			}
		}

		job, err := database.GetSiteById(j.Id)
		if err != nil {
			log.Print("ERROR: worker ", id, " job id: ", j.Id, " ", j.Url, " Failed to find record: ", err)
			continue
		}

		job.Name = strings.ReplaceAll(job.Name, "/", "-")
		job.Name = strings.ReplaceAll(job.Name, `"`, "")

		log.Print("INFO: worker ", id, " started job id: ", j.Id, " ", j.Url)
		job.Status = "processing"
		err = database.UpdateSite(job)
		if err != nil {
			log.Print("ERROR: worker ", id, " job id: ", j.Id, " ", j.Url, " ", err)
		}

		err = scrape(ctx, &job)
		if err != nil {
			job.Status = "failed"
			log.Print("ERROR: worker ", id, " job id: ", j.Id, " ", j.Url, " ", err)
		}

		err = database.UpdateSite(job)
		if err != nil {
			log.Print("ERROR: worker ", id, " job id: ", j.Id, " ", j.Url, " ", err)
		}

		log.Print("INFO: worker ", id, " completed job id: ", j.Id, " ", j.Url)
	}
}

func scrape(ctx context.Context, job *database.Site) error {
	c := LoadConfig()

	pages := []string{}
	data := []Output{}
	var site *url.URL
	var err error

	if job.Url != "" {
		if !strings.HasPrefix(job.Url, "http://") && !strings.HasPrefix(job.Url, "https://") {
			job.Url = "http://" + job.Url
		}
		site, err = url.Parse(job.Url)
		if err != nil {
			return errors.New("Failed to parse site URL: " + err.Error())
		}

		pages = append(pages, "")
	}

	for i := 0; i < len(pages) && i < c.PageLimit; i++ {
		fmt.Println(pages[i])
		time.Sleep(time.Second * time.Duration(c.Timeout))

		wCtx, cancel := chr.NewContext(ctx)
		wCtx, cancelTimeout := context.WithTimeout(wCtx, time.Duration(c.PageLoadTimeout)*time.Second)

		var newPages []*cdp.Node

		// run task list
		var res string
		var title string
		err := chr.Run(wCtx, chr.Tasks{
			chr.Navigate(site.Scheme + "://" + site.Host + pages[i]),
			chr.Nodes("a", &newPages),
			chr.Text(`body`, &res),
			chr.Title(&title),
		})
		// Page loading done, release browser resources
		cancel()
		cancelTimeout()
		if err != nil {
			log.Print("ERROR: job id: ", job.Id, " ", site.Host+pages[i], " Failed to load page: ", err.Error())
			continue
		}

		res = strings.ReplaceAll(res, "\n", " ")

		o := Output{
			Title:   title,
			Url:     site.Scheme + "://" + site.Host + pages[i],
			Content: res,
		}

		data = append(data, o)

	newPageLoop:
		for _, n := range newPages {
			rawPage := n.AttributeValue("href")
			if strings.HasPrefix(rawPage, "data:") {
				continue
			}
			rawPage = strings.Trim(rawPage, " ")
			u, err := url.Parse(rawPage)
			if err != nil {
				log.Print("ERROR: job id:", job.Id, " ", job.Url, " Failed to parse page URL: ", err.Error())
				continue
			}

			if u.Host == "" && u.Path == "" {
				continue
			}

			if u.Path == "/" {
				continue
			}

			for _, suffix := range c.AvoidExtensions {
				if strings.HasSuffix(u.Path, suffix) {
					continue newPageLoop
				}
			}

			// Remove existing slash in path and add it manually in cases where links do not have leading slash
			page := "/" + strings.TrimPrefix(u.Path, "/")

			// If host is empty or host is the same as the site being scraped
			if u.Host == "" || strings.Contains(u.Host, strings.TrimPrefix(site.Host, `www.`)) {
				if !contains(pages, page) {
					pages = append(pages, page)
				}
			}
		}

		job.Progress = fmt.Sprint(i+1, "/", len(pages))

		if i%5 == 0 {
			err = database.UpdateSite(*job)
			if err != nil {
				log.Print("ERROR: ", err)
			}
		}
	}

	dnbData := map[string]interface{}{}
	json.Unmarshal([]byte(job.Data), &dnbData)

	if len(data) > 0 {
		dnbData["data"] = data
	}

	jData, err := json.Marshal(dnbData)
	if err != nil {
		return errors.New("Failed to marshal data: " + err.Error())
	}

	fileName := fmt.Sprintf("%s.json", job.Name)
	err = database.UploadFile(fileName, jData)
	if err != nil {
		return errors.New("Data upload failed: " + err.Error())
	}
	job.Status = "done"
	return nil
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
