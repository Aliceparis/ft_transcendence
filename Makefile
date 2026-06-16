
STACK = transcenence 

#init docker swarm for docker secret
init:
	docker swarm init --advertise-addr 172.25.155.134 || true

# input all files in secrets to docker secret
secrets: 
	@echo "Create docker secrets......"
	
	@for file in secrets/*.txt; do \
		name=$$(basename $$file .txt); \
		if docker secret inspect $$name >/dev/null 2>&1; then \
			echo "Secret $$name already exists, skipping"; \
		else \
			echo "Creating $$name"; \
			cat $$file | docker secret create $$name -; \
		fi \
	done
deploy:
	docker stack deploy -c docker-compose.yml $(STACK)

rm:
	docker stack rm $(STACK)

reset-secrets:
	@for file in secrets/*.txt; do \
		name=$$(basename $$file .txt); \
		docker secret rm $$name || true; \
	done

#------------------
# docker compose 
#------------------

up: 
	docker compose up --build 

down: 
	docker compose down 

logs:
	docker compose logs -f 

restart:
	docker compose down -v && docker compose up --build

.PHONY: secrets init deploy rm reset-secrets up down  logs restart 