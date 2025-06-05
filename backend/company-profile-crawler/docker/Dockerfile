FROM golang:latest

WORKDIR /app

COPY ../. .

RUN apt-get update
RUN apt-get install -y chromium
