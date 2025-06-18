# Use an official Python runtime as a parent image
FROM python:3.11

# Set the working directory in the container
WORKDIR /init_app
COPY requirements.txt /init_app/requirements.txt
COPY ./src /init_app

# Install any needed packages specified in requirements.txt
RUN pip install -r /init_app/requirements.txt
RUN pip install --upgrade streamlit

WORKDIR /app
RUN cp -r /init_app/* /app/
# Make port 8055 available to the world outside this container
EXPOSE 8501

HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health
#CMD ["python", "dev_local.py"]
#CMD ["streamlit", "run", "streamlit_app.py"]

ENTRYPOINT ["streamlit", "run", "/app/streamlit_app.py", "--server.port=8501", "--server.address=0.0.0.0"]



