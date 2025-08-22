# Upload CSV - Trading Artificial

## Endpoint

**POST** `/data/upload-csv`

## Descripción

Endpoint para subir archivos CSV con datos de precios OHLC y reemplazar datasets existentes de forma atómica.

## Parámetros

### Query Parameters (opcionales)
- `symbol`: Símbolo del instrumento (ej: SPY, BTC)
- `timeframe`: Timeframe de los datos (D1, H4, H1, M15, M5)

### Body (multipart/form-data)
- `file`: Archivo CSV con datos de precios

## Detección de Symbol y Timeframe

El sistema detecta el symbol y timeframe en el siguiente orden de prioridad:

1. **Query parameters** (más alta prioridad)
2. **Headers del CSV** (comentarios)
3. **Nombre del archivo** (más baja prioridad)

### Headers del CSV
```csv
# symbol: SPY
# timeframe: D1
time,open,high,low,close
1640995200,476.50,477.20,475.80,476.90
1641081600,476.90,478.10,476.50,477.80
```

### Nomenclatura de archivo
```
SYMBOL__TIMEFRAME.csv
```
Ejemplos:
- `SPY__D1.csv`
- `BTC__H4.csv`
- `AAPL__M15.csv`

## Formato del CSV

### Columnas Requeridas
- `time`: Timestamp en segundos UNIX
- `open`: Precio de apertura
- `high`: Precio más alto
- `low`: Precio más bajo
- `close`: Precio de cierre

### Ejemplo de CSV
```csv
time,open,high,low,close
1640995200,476.50,477.20,475.80,476.90
1641081600,476.90,478.10,476.50,477.80
1641168000,477.80,479.50,477.20,479.20
```

## Comportamiento de Reemplazo

### Política de Reemplazo
Si existe un dataset con el mismo `(symbol, timeframe)`:
1. **Elimina completamente** el dataset anterior (CASCADE DELETE)
2. **Crea un nuevo dataset** con los datos del CSV
3. **Garantiza consistencia** mediante transacciones atómicas

### Datos Eliminados
- Dataset anterior
- Todas las velas (Candle)
- Todos los pivotes (Pivot)
- Todos los candidatos de líneas (LineCandidate)
- Todos los scores y feedback relacionados

## Límites y Validaciones

### Tamaño del Archivo
- **Máximo**: 100MB
- **Límite de filas**: Configurable por `MAX_CSV_ROWS` (default: 1,000,000)

### Validaciones
- ✅ Formato CSV válido
- ✅ Columnas requeridas presentes
- ✅ Timestamps en segundos UNIX válidos
- ✅ Precios numéricos válidos
- ✅ Symbol y timeframe detectados
- ❌ Archivos vacíos
- ❌ Formatos no soportados

### Procesamiento
- **Ordenamiento**: Por timestamp ascendente
- **Deduplicación**: Elimina timestamps duplicados (queda el último)
- **Inserción**: En lotes de 10,000 registros
- **tIdx**: Asignado incrementalmente (0, 1, 2, ...)

## Ejemplos de Uso

### 1. Upload con Query Parameters
```bash
curl -X POST "http://localhost:3000/data/upload-csv?symbol=SPY&timeframe=D1" \
  -F "file=@./data.csv" \
  -H "Content-Type: multipart/form-data"
```

### 2. Upload con Headers en CSV
```bash
curl -X POST "http://localhost:3000/data/upload-csv" \
  -F "file=@./SPY__D1.csv" \
  -H "Content-Type: multipart/form-data"
```

### 3. Upload con Nomenclatura de Archivo
```bash
curl -X POST "http://localhost:3000/data/upload-csv" \
  -F "file=@./BTC__H4.csv" \
  -H "Content-Type: multipart/form-data"
```

## Respuesta

### Éxito (200 OK)
```json
{
  "datasetId": "clx1234567890",
  "symbol": "SPY",
  "timeframe": "D1",
  "rows": 252,
  "sourceFile": "SPY__D1.csv"
}
```

### Errores

#### 400 Bad Request
- CSV vacío o sin datos válidos
- Columnas requeridas faltantes
- Precios no numéricos
- Timestamps inválidos

#### 413 Payload Too Large
- Archivo excede límite de filas
- Archivo excede 100MB

#### 422 Unprocessable Entity
- Symbol o timeframe no detectados
- Timeframe no válido

#### 500 Internal Server Error
- Error en base de datos
- Error en procesamiento del CSV

## Variables de Entorno

```bash
# Límite máximo de filas en CSV
MAX_CSV_ROWS=1000000

# URL de la base de datos
DATABASE_URL=postgresql://postgres:postgres@ta-db:5432/trenddb?schema=public
```

## Consideraciones de Rendimiento

### Inserción en Lotes
- **Tamaño del lote**: 10,000 registros
- **Transacciones**: Atómicas para garantizar consistencia
- **Índices**: Optimizados para consultas por dataset y tiempo

### Memoria
- **Streaming**: Procesamiento línea por línea
- **Buffer**: Solo mantiene datos del lote actual
- **Escalabilidad**: Maneja archivos de millones de filas

## Testing

### Archivo de Prueba
Crear `test_data.csv`:
```csv
time,open,high,low,close
1640995200,100.00,101.00,99.00,100.50
1641081600,100.50,102.00,100.00,101.50
```

### Comando de Prueba
```bash
curl -X POST "http://localhost:3000/data/upload-csv?symbol=TEST&timeframe=D1" \
  -F "file=@./test_data.csv" \
  -H "Content-Type: multipart/form-data"
```

## Próximos Pasos

- [ ] Implementar validación de rangos de precios
- [ ] Agregar soporte para volumen (opcional)
- [ ] Implementar progreso de upload para archivos grandes
- [ ] Agregar autenticación y autorización
- [ ] Implementar rate limiting
