# Web Scraper

Simple golang app to extract text from provided sites.
Consists of 2 services:

- API: Exposes 2 endpoints to add new sites to scrape and check the status of existing jobs.
- Scraper: The worker that does the actual scraping.

The API stores new sites in the mysql database and the Scraper checks periodically and takes pending jobs.
The scraped data is added to the initial company data and uploaded to the `web-scraper-v3` azure blob storage container as a JSON file with the company name.

## config.json

Configuration file for the scraper located in `/go/scraper/config.json`

- timeout: time in seconds to wait between each request
- page_load_timeout: time in seconds to wait for a page to load
- page_limit: number of pages to visit on each site
- runners: number of scraper runners to process sites in parallel
- job_interval: interval in seconds for the scraper to check for new jobs
- avoid_extensions: array of suffixes of pages to avoid
- database: database connection details
- storage: blob storage access credentials

## Requirements

The following packages need to be installed on the host machine:

- docker
- docker-compose
- make

## Usage

Start the scraper with `make run` in the root directory.

Make a POST request to `localhost:8080/sites` with the following JSON schema containing the name and website of the companies to scrape together with any additional data.

```json
[
    {
        "name": "GrabIT",
        "website": "https://grabit.io"
    },
    {
        "name": "Example",
        "website": "https://example.com"
    }
]
```

Example curl request to add a site: `curl -X POST localhost:8080/sites -H 'Content-Type: application/json' -d '[{name:"GrabIT",website:"https://grabit.io"}]'`

Make a GET request to `localhost:8080/sites` (or open the link in a browser) to get the status of current jobs.

The scraped text from the website pages is added to the initial company data and uploaded to the `web-scraper-v3` azure blob storage container as a JSON file with the company name.

Use `make stop` to stop the docker environment.

## API

The API is generated from `scraper-api.yaml` using `oapi-codegen`.
If the API spec is modified the code must be regenerated using: `oapi-codegen -generate types,server,strict-server -package main scraper-api.yaml > go/api/api.go`
