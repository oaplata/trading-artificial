from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = FastAPI(
    title="Trading Artificial ML Service",
    description="Servicio de Machine Learning para análisis de mercados financieros",
    version=os.getenv("ML_SERVICE_VERSION", "1.0.0"),
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class HealthResponse(BaseModel):
    status: str
    service: str
    name: str
    version: str

class PivotPoint(BaseModel):
    price: float
    confidence: float
    type: str  # 'support' or 'resistance'

class Candidate(BaseModel):
    symbol: str
    score: float
    reason: str

# Endpoints
@app.get("/", response_model=Dict[str, str])
async def root():
    return {
        "message": "Trading Artificial ML Service",
        "version": os.getenv("ML_SERVICE_VERSION", "1.0.0")
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        service="ml",
        name="trading-artificial",
        version=os.getenv("ML_SERVICE_VERSION", "1.0.0")
    )

@app.get("/pivots", response_model=list[PivotPoint])
async def get_pivots():
    """
    Endpoint stub para obtener puntos pivote (soportes y resistencias)
    """
    # TODO: Implementar lógica real de ML
    return [
        PivotPoint(price=42150.0, confidence=0.95, type="support"),
        PivotPoint(price=44800.0, confidence=0.87, type="resistance"),
    ]

@app.get("/candidates", response_model=list[Candidate])
async def get_candidates():
    """
    Endpoint stub para obtener candidatos de trading
    """
    # TODO: Implementar lógica real de ML
    return [
        Candidate(
            symbol="BTC/USD",
            score=0.85,
            reason="Fuerte soporte en $42,150 con volumen creciente"
        ),
        Candidate(
            symbol="ETH/USD",
            score=0.72,
            reason="Patrón de reversión en resistencia $2,800"
        ),
    ]

@app.get("/score/{symbol}")
async def get_score(symbol: str):
    """
    Endpoint stub para obtener score de un símbolo específico
    """
    # TODO: Implementar lógica real de ML
    return {
        "symbol": symbol,
        "score": 0.78,
        "confidence": 0.85,
        "factors": [
            "Análisis técnico: 0.8",
            "Análisis de volumen: 0.75",
            "Patrones de precio: 0.79"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "true").lower() == "true"
    )
