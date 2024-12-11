start-services:
	- ./docker/scripts/init.sh
stop-services:
	- docker compose down
build:
	- docker build -f ./Dockerfile-prod -t ms-crm-legacy-container:latest .
start:
	- docker run --name ms-crm-legacy-container -d ms-crm-legacy-container:latest
exec:
	- docker exec -it ms-crm-legacy-container /bin/sh
logs:
	- docker logs -f --tail 50 --timestamps ms-crm-legacy-container
