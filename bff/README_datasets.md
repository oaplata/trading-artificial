# Datasets API - Trading Artificial

## Endpoints Disponibles

### 1. Listar Datasets

**GET** `/data/datasets`

#### Query Parameters
- `symbol` (opcional): Filtrar por símbolo (búsqueda parcial, case-insensitive)
- `timeframe` (opcional): Filtrar por timeframe (D1, H4, H1, M15, M5)
- `page` (opcional): Número de página (default: 1)
- `pageSize` (opcional): Tamaño de página (default: 20)
- `order` (opcional): Ordenamiento (uploadedAt_desc, uploadedAt_asc)

#### Ejemplo de Request
```bash
curl "http://localhost:3000/data/datasets?page=1&pageSize=20&symbol=SPY&timeframe=D1"
```

#### Ejemplo de Response
```json
{
  "items": [
    {
      "id": "cmem6lkbr00019dgv84pkfaiv",
      "symbol": "SPY",
      "timeframe": "D1",
      "rows": 8183,
      "uploadedAt": "2025-08-22T01:58:09.540Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

### 2. Obtener Velas de un Dataset

**GET** `/data/datasets/:id/candles`

#### Path Parameters
- `id`: ID del dataset

#### Query Parameters
- `fromTime` (opcional): Fecha de inicio (ISO string)
- `toTime` (opcional): Fecha de fin (ISO string)
- `limit` (opcional): Límite de velas (default: 100000)

#### Ejemplo de Request
```bash
curl "http://localhost:3000/data/datasets/cmem6lkbr00019dgv84pkfaiv/candles?limit=50000"
```

#### Ejemplo de Response
```json
{
  "dataset": {
    "id": "cmem6lkbr00019dgv84pkfaiv",
    "symbol": "SPY",
    "timeframe": "D1",
    "rows": 8183,
    "uploadedAt": "2025-08-22T01:58:09.540Z"
  },
  "candles": [
    {
      "time": 1640995200000,
      "open": 476.5,
      "high": 477.2,
      "low": 475.8,
      "close": 476.9,
      "tIdx": 0
    }
  ]
}
```

### 3. Upload CSV

**POST** `/data/upload-csv`

#### Query Parameters
- `symbol` (opcional): Símbolo del instrumento
- `timeframe` (opcional): Timeframe de los datos

#### Body
- `file`: Archivo CSV (multipart/form-data)

#### Ejemplo de Request
```bash
curl -X POST "http://localhost:3000/data/upload-csv?symbol=SPY&timeframe=D1" \
  -F "file=@./SPY.csv" \
  -H "Content-Type: multipart/form-data"
```

#### Ejemplo de Response
```json
{
  "datasetId": "cmem6lkbr00019dgv84pkfaiv",
  "symbol": "SPY",
  "timeframe": "D1",
  "rows": 8183,
  "sourceFile": "SPY.csv"
}
```

## Notas Importantes

### Formato de Tiempo
- **Velas**: El campo `time` se devuelve en **epoch milliseconds** para compatibilidad directa con Lightweight-Charts
- **Dataset**: El campo `uploadedAt` se devuelve en **ISO string**

### Paginación
- **Default**: page=1, pageSize=20
- **Máximo**: pageSize=100 (configurable)
- **Ordenamiento**: Por defecto por fecha de upload descendente (más reciente primero)

### Filtros
- **Symbol**: Búsqueda parcial, case-insensitive
- **Timeframe**: Filtro exacto por enum
- **Fechas**: Filtro por rango de tiempo en velas

### Límites
- **Velas por request**: Máximo 100,000 (configurable)
- **Archivos CSV**: Máximo 100MB
- **Filas por CSV**: Máximo 1,000,000 (configurable por MAX_CSV_ROWS)

## Ejemplos de Uso

### Listar todos los datasets de SPY
```bash
curl "http://localhost:3000/data/datasets?symbol=SPY"
```

### Obtener velas de los últimos 30 días
```bash
curl "http://localhost:3000/data/datasets/ID/candles?fromTime=2025-07-23T00:00:00.000Z"
```

### Paginación avanzada
```bash
curl "http://localhost:3000/data/datasets?page=2&pageSize=10&order=uploadedAt_asc"
```

## Próximos Pasos

- [ ] Implementar autenticación
- [ ] Agregar rate limiting
- [ ] Implementar cache para velas
- [ ] Agregar métricas de uso
- [ ] Soporte para múltiples formatos de archivo
