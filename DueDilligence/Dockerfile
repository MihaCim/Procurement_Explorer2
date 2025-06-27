FROM python:3.11

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Copy and install dependencies first (cached unless requirements.txt changes)
COPY requirements.txt .
RUN pip install -r requirements.txt && \
    pip install --upgrade streamlit


#COPY ./src/streamlit_app.py ./streamlit_app.py
COPY ./src .

# Expose Streamlit port
EXPOSE 8501

# Healthcheck
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health || exit 1

# Entry point
ENTRYPOINT ["streamlit", "run", "streamlit_app.py", "--server.port=8501", "--server.address=0.0.0.0"]
