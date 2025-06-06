## Crawling the web - libraries & tools available

Review of solutions and technologies for web scraping

1. **ScrapeGraphAI:** www.scrapegraphai.com

   Web strapers endpoint with LLM abstraction - free tier avaialble.


## Refactoring

1. **SQLModel:** www.sqlmodel.tiangolo.com

   SQLModel, SQL databases in Python, designed for simplicity, compatibility, and robustness.

2. **Formatting:** 

- Standardize formatting and type checking (eg. with Ruff and PyRight)

## System design

1. **Go scraper:**
- The Go API handles only creation of entries inside the SQL database. A possible improvement would be to omitt this service and the FastAPI server pushes directly to the database (remove the middleman). 
- Replace Go scraper with python Scrapy. Use already implemented code for scaling, crawling, timeouts etc. 
- Current implementation (checking for pending sites on the database) does not support efficient paralelization (2 instances of the same go scraper would fetch the same pending sites and possibly process them at the same time). To circumvent this we would need to change the schema a bit (remove the status column) and make use of some scaling framework (celery with redis). Sites to be scrapped would be pushed to the redis queue and celery would distribute tasks to individual workers - building upon the idea above, the scraper can be a Scrapy spider. 

2. **Add foreign keys to the SQL database**

- eg. sites and raw_data tables (name and filename)


## Miscelaneous

1. **DnB:** 

   Key people can be extracted from the DnB database. 

2. **Search:** 

   duckduckgo_search can be used to obtain urls relevant to a particular search query (pro: more scalable than google_search, con: not as fresh as google search)


test