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

pgadmin: ## Abrir pgAdmin en el navegador
	@echo "🚀 Abriendo pgAdmin..."
	@echo "📊 URL: http://localhost:8080"
	@echo "👤 Email: admin@trading-artificial.com"
	@echo "🔑 Password: admin123"
	@if command -v open &> /dev/null; then open "http://localhost:8080"; \
	elif command -v xdg-open &> /dev/null; then xdg-open "http://localhost:8080"; \
	else echo "🌐 Abre manualmente: http://localhost:8080"; fi

db-connect: ## Conectar a la base de datos PostgreSQL
	docker compose -f infra/docker-compose.dev.yml exec ta-db psql -U postgres -d trenddb
