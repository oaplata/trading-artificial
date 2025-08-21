.PHONY: help dev-up dev-down dev-logs clean

help: ## Mostrar ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev-up: ## Levantar todos los servicios en modo desarrollo
	docker compose -f infra/docker-compose.dev.yml up --build

dev-down: ## Detener todos los servicios
	docker compose -f infra/docker-compose.dev.yml down -v

dev-logs: ## Mostrar logs de todos los servicios
	docker compose -f infra/docker-compose.dev.yml logs -f

clean: ## Limpiar completamente (detener, remover volúmenes y limpiar Docker)
	docker compose -f infra/docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

status: ## Mostrar estado de los servicios
	docker compose -f infra/docker-compose.dev.yml ps

restart: ## Reiniciar todos los servicios
	docker compose -f infra/docker-compose.dev.yml restart
