# https://medium.com/analytics-vidhya/django-with-docker-and-docker-compose-python-part-1-da0ed3f61566

FROM python:3.10.14-bookworm
# 3.12.5-bookworm

WORKDIR /app

RUN addgroup --system app && adduser --system --group app


# set environment variables
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE=1


# run this cause of error
# https://stackoverflow.com/questions/55313610/importerror-libgl-so-1-cannot-open-shared-object-file-no-such-file-or-directo

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc
RUN apt-get update && apt-get install -y stress-ng

RUN pip install --upgrade pip

COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# copy project
COPY . .

RUN chmod +x run.sh

ENV PYTHONPATH=/app

RUN chown -R app:app $HOME

RUN ls -la /app >&2
RUN echo $HOME >&2
CMD ["python3", "app.py"]


