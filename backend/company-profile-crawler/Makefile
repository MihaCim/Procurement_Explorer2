include .env
.PHONY=run stop generate/api deploy/staging

run:
	docker compose up -d

stop:
	docker-compose down

generate/api:
	oapi-codegen -generate types,server -package main scraper-api.yaml > go/api/api.go

deploy/staging:
	echo "Deploying..."
	ssh root@$(HOST_IP) "cd ~/web-scraper; make stop;"
	rsync -ravzpg ./ root@$(HOST_IP):/root/web-scraper/
	ssh root@$(HOST_IP) "cd ~/web-scraper; make run;"
