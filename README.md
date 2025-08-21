# Trading Artificial

## Propósito
Análisis de mercados financieros comenzando con líneas de tendencia y ampliable a módulos técnicos y macroeconómicos avanzados.

## Arquitectura
Monorepo con servicios especializados:
- **Frontend**: Vue 3 + Vite + TypeScript + Tailwind + Lightweight-Charts
- **BFF**: NestJS + Prisma + PostgreSQL (API Gateway)
- **ML Service**: FastAPI + Python 3.11 (Análisis y ML)
- **Infra**: Docker + docker-compose para desarrollo local

## Roadmap
### Fase 1: Líneas de Tendencia ✅
- Detección automática de soportes y resistencias
- Análisis de patrones de precio
- Scoring de calidad de líneas

### Fase 2: Análisis Técnico (Próximamente)
- Indicadores técnicos (RSI, MACD, Bollinger Bands)
- Patrones de velas japonesas
- Análisis de volumen

### Fase 3: Análisis Macroeconómico (Futuro)
- Correlaciones entre mercados
- Análisis de sentimiento
- Factores macro que afectan precios

## Desarrollo Local

### Prerrequisitos
- Docker y Docker Compose
- Node.js 22 LTS
- Python 3.11+

### Comandos Rápidos
```bash
# Levantar todos los servicios
make dev-up
# o
npm run dev-up

# Detener servicios
make dev-down
# o
npm run dev-down
```

### URLs de Desarrollo
- **Frontend**: http://localhost:5173
- **BFF API**: http://localhost:3000/health
- **ML Service**: http://localhost:8000/health
- **PostgreSQL**: localhost:5432

### Estructura del Proyecto
```
trading-artificial/
├── frontend/          # Vue 3 + Vite + Tailwind
├── bff/              # NestJS + Prisma
├── ml-service/       # FastAPI + Python
└── infra/            # Docker + Compose
```

## Contribución
Este proyecto está bajo licencia MIT. Las contribuciones son bienvenidas.
