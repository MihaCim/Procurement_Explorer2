#!/bin/sh

alembic upgrade head

export APP_MODULE=${APP_MODULE-app.app:app}
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-8080}
##export BACKEND_CORS_ORIGINS=${BACKEND_CORS_ORIGINS}
#exec gunicorn --bind $HOST:$PORT "$APP_MODULE" -k uvicorn.workers.UvicornWorker
python app.py