#!/bin/bash

if [ "$APP_MODE" = "streamlit" ]; then
    echo "Starting in Streamlit mode..."
    exec streamlit run streamlit_app.py --server.port=8501 --server.address=0.0.0.0
else
    echo "Starting in Uvicorn mode..."
    exec uvicorn run:app --host 0.0.0.0 --port 8501 #--workers 4
fi
