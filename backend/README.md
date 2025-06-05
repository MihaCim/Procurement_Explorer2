## Procurement Explorer Proof Of Concept

The solution is composed of three main components, namely:

1. **Web Scraper:** _WebScraper/web_scraper_

   A general web site scraper: receives a url of web sites to crawl on API endpoint, 
   crawls the complete company web site and stores data into one json file.


2. **Companies Scraper:** _WebScraper/company_scraper_

   A worker that crawls the DNB site for a list of companies with their web site URL. The copanies website URLs
   get forwarded to Web Scraper for retrieval whole company website data.


3. **Application:** _Procurement Explorer_

    The Proof Of Concept (Poc) application, with UI for testing functionalities of Company Explorer Application.
    The application includes a sample of vectorstore files tu run the app directly with files.
    
    
     NOTE: Before starting the application, download the vectorstore database from url:
          https://drive.google.com/drive/folders/1lvPDVRFr0VzPgAGQty6pCcb8jxcSdo-v?usp=drive_link

     The vectorstore should be exctracted to "produrement_explorer/data/company_vector_store directory"