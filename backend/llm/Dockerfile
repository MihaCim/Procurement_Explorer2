FROM ollama/ollama

RUN apt-get update && apt-get install -y dos2unix

COPY run-ollama.sh /tmp/run-ollama.sh

WORKDIR /tmp

RUN dos2unix ./run-ollama.sh

RUN chmod +x run-ollama.sh \
    && ./run-ollama.sh

EXPOSE 11434