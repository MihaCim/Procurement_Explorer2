-- Create the companies table with updated fields from the Company and CompanyProfile models
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,                   -- Primary Key: Unique identifier for each company
    name VARCHAR,                            -- Optional: Name of the company
    website VARCHAR UNIQUE NOT NULL,         -- Mandatory: Website of the company
    status VARCHAR DEFAULT 'Pending',        -- Optional: Status of the company (default is 'Pending')
    review_date DATE,                        -- Optional: Review date for the company
    due_diligence_status VARCHAR,            -- Optional: Due diligence status of the company
    added_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Optional: Timestamp when the company was added (default to current timestamp)
    risk_level INTEGER,                      -- Optional: Risk level of the company (e.g., 1-5 scale)
    profile_last_updated TIMESTAMP,          -- Optional: Timestamp when the company profile was last updated
    due_diligence_last_updated TIMESTAMP,    -- Optional: Timestamp when the due diligence status was last updated
    
    -- New fields based on the CompanyProfile model
    country VARCHAR,                          -- Country of the company
    industry VARCHAR,                          -- Sub-industry of the company
    subindustries VARCHAR[],                    -- Sub-industry of the company
    contact_information JSONB,                 -- Contact details of the company (using JSONB for flexible structure)
    products_portfolio TEXT[],                 -- Product offerings of the company
    service_portfolio TEXT[],                  -- Service offerings of the company
    specific_tools_and_technologies TEXT[],    -- Technologies used by the company
    specializations TEXT[],                    -- Areas of specialization of the company
    quality_standards TEXT[],                  -- Quality standards maintained by the company
    company_size VARCHAR,                      -- The size of the company
    company_profile TEXT,                       -- General profile and overview of the company

    -- Special fields
    description TEXT,                          -- Optional: Description of the company
    verdict VARCHAR                            -- Optional: Verdict of the company
);

-- Create the websites table
CREATE TABLE websites (
                          id SERIAL PRIMARY KEY,
                          website VARCHAR UNIQUE NOT NULL,
                          status VARCHAR NOT NULL,
                          added_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          scraped_timestamp TIMESTAMP
);

-- Create the documents table
CREATE TABLE documents (
                           id SERIAL PRIMARY KEY,
                           file_name VARCHAR NOT NULL,
                           status VARCHAR NOT NULL,
                           added_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           processed_timestamp TIMESTAMP
);


-- Create the document_suitable_companies table
CREATE TABLE document_suitable_companies (
                                             document_id INTEGER REFERENCES documents(id),
                                             company_id INTEGER REFERENCES companies(id),
                                             distance INTEGER
);


-- Create the due_diligence_profiles table based on the DueDiligenceProfile model
CREATE TABLE due_diligence_profiles (
    id BIGSERIAL PRIMARY KEY,                  -- Primary Key: Unique identifier for each profile
    name VARCHAR,                           -- Optional: Name of the company or profile
    url VARCHAR,                            -- Optional: URL field
    contacts JSONB,                         -- Optional: COntacts dict
    founded INTEGER,                        -- Optional: Year the company was founded
    founder VARCHAR,                        -- Optional: Founder of the company
    address JSONB,                          -- Optional: Address as a JSON object (e.g., street, city)
    country VARCHAR,                        -- Optional: Country field
    last_revision TIMESTAMP,                -- Optional: Last revision field
    risk_level INTEGER,                     -- Optional: Risk level (e.g., 1-5 scale)
    description TEXT,                       -- Optional: Description of the profile
    key_individuals JSONB,                  -- Optional: Key individuals as a JSON object (e.g., name, title)
    security_risk JSONB,                    -- Optional: Security risk as a JSON object
    financial_risk JSONB,                   -- Optional: Financial risk as a JSON object
    operational_risk JSONB,                 -- Optional: Operational risk as a JSON object
    key_relationships JSONB,                -- Optional: Key relationships as a JSON object
    metadata JSONB,                         -- Optional: Metadata for due diligence
    status VARCHAR,                         -- Optional: Status for due diligence
    due_diligence_timestamp TIMESTAMP,       -- Optional: Timestamp for due diligence    
    logs JSONB    
);


-- Create the company raw crawled data table 
CREATE TABLE IF NOT EXISTS raw_data (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    data BYTEA NOT NULL
);

-- Create the sites data
CREATE TABLE sites (
                       id SERIAL PRIMARY KEY,
                       name VARCHAR(255) NOT NULL,
                       url VARCHAR(255),
                       data TEXT,
                       status VARCHAR(20) NOT NULL,
                       progress VARCHAR(20) NOT NULL,
                       created_at TIMESTAMP NULL DEFAULT NULL,
                       updated_at TIMESTAMP NULL DEFAULT NULL
);
