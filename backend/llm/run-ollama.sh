#!/usr/bin/env bash

ollama serve &
ollama list
ollama pull nomic-embed-text:latest

ollama serve &
ollama list
ollama pull mistral:latest