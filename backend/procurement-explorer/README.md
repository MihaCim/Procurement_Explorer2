## Setup Environment
Before setting up the environment, ensure Python and Ollama are installed on your system.

Download the latest version of Ollama service from:
- [Ollama](https://ollama.com/)

To set up the development environment for this project, follow these steps:

1. **Navigate to** _/ProcurentExplorer_ **directory:**

    ```bash
    cd your-project
    ```

2. **Environment variables setup**
    - In **_.env-example_** you can find a template for the **_.env_** file.
    If you want to use the application with default settings just rename the .env-example to .env.
    -  In case you want to rebuild the vector store or to run the summarization process
    you should fill the blanks for the Azure configuration.
    - If you want automatic deploy, you should set the DEPLOY_HOST and DEPLOY_PATH

3. **Install project dependencies:**

    ```bash
    make install
    ```
    This command installs project dependencies using pipenv and pulls necessary Ollama models.
    You can change Ollama models using the .env file.


## Usage

To run the project locally, follow these steps:

1. **Start the application:**

    ```bash
    make run
    ```

    This command will start the Ollama serve, uvicorn API, and Streamlit app.

2. **Access the application:**

    - Ollama serve: [http://localhost:11434](http://localhost:your-port)
    - API: [http://localhost:8000/docs](http://localhost:8000/docs)
    - Streamlit app: [http://localhost:8001](http://localhost:8001)

## Deployment

To deploy the application, follow these steps:

1. **Deploy to staging:**

    ```bash
    make deploy/staging
    ```

    This command will deploy the application to the staging environment.
    Note: You need to set the DEPLOY_HOST and DEPLOY_PATH in .env file and ensure proper ssh connection to the host.

## Project Structure

### Directories

- `data`: This directory contains the company vector database which is used by the persistent chroma db client.
- `logs`: A directory intended for log files where the application's runtime events are recorded for monitoring and debugging purposes.
- `src`: The source directory where the main application code is stored.
-----
- `.env-example`: An example or template file showing the required format and variables for the `.env` file, but without sensitive information.
- `app.py`: Entrypoint to the FastAPI app - application backend.
- `streamlit_app.py`: Streamlit application used as a visual interface for utilizing the API.
-----
- `rebuild_vector_store.py`: This Python script is utilized to rebuild the collection of vector databases stored in the `data` folder. To utilize this script, ensure you have Azure credentials to access the data from the input blob storage.
- `summarize_profiles.py`: This standalone script is used in the summarization process of raw company website text. To utilize this script, make sure to configure the appropriate Azure credentials for accessing input blob storage data and for writing the resulting summaries to the target blob storage.