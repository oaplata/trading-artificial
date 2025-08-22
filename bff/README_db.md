# Base de Datos - Trading Artificial

## Descripción General

Este documento describe el modelo de datos para el sistema de análisis de líneas de tendencia. La base de datos está diseñada para manejar datasets de precios, detectar pivotes y generar candidatos de líneas de tendencia con scoring y feedback.

## Entidades y Relaciones

```
Dataset (1) ←→ (N) Candle
Dataset (1) ←→ (N) Pivot  
Dataset (1) ←→ (N) LineCandidate
LineCandidate (1) ←→ (N) LineScore
LineCandidate (1) ←→ (N) Feedback
```

### Diagrama Textual

```
Dataset
├── Candle[] (velas de precios)
├── Pivot[] (puntos pivote HIGH/LOW)
└── LineCandidate[] (candidatos de líneas)
    ├── LineScore[] (scores de modelos ML)
    └── Feedback[] (feedback humano)
```

## Modelos Principales

### Dataset
- **Propósito**: Contenedor principal para datos de un símbolo y timeframe
- **Clave única**: `[symbol, timeframe]` - permite reemplazo atómico
- **Relaciones**: CASCADE DELETE en todas las dependencias

### Candle
- **Propósito**: Velas de precios OHLC con timestamps UTC
- **Índices**: `[datasetId, tIdx]` y `[datasetId, time]` para consultas rápidas
- **tIdx**: Índice incremental por dataset para cálculos de rectas

### Pivot
- **Propósito**: Puntos pivote HIGH/LOW detectados automáticamente
- **Escala**: Factor k de ATR o escala relativa para normalización

### LineCandidate
- **Propósito**: Candidatos de líneas de tendencia (y = mx + b)
- **Features**: JSON con métricas de calidad (touch_count, r2, etc.)
- **Relaciones**: Scores de ML y feedback humano

## Claves Únicas e Índices

### Constraints Únicos
- `Dataset(symbol, timeframe)` - Identificación única por par
- `Candle(datasetId, time)` - Prevención de duplicados temporales

### Índices de Rendimiento
- `Dataset(symbol, timeframe)` - Búsquedas por símbolo/TF
- `Candle(datasetId, tIdx)` - Cálculos de rectas rápidos
- `Candle(datasetId, time)` - Consultas temporales
- `Pivot(datasetId, type)` - Filtrado por tipo de pivote
- `LineCandidate(datasetId, type)` - Filtrado por tipo de línea
- `LineScore(candidateId, modelVersion)` - Scores por modelo
- `Feedback(candidateId)` - Feedback por candidato

## Política de Reemplazo

**"Si existe Dataset(symbol, timeframe), borrar ese dataset (cascade) y crear uno nuevo antes de insertar velas."**

### Implementación
1. **Transacción atómica**: DELETE + INSERT en una transacción
2. **CASCADE DELETE**: Automáticamente elimina:
   - Todas las velas (Candle)
   - Todos los pivotes (Pivot)
   - Todos los candidatos de líneas (LineCandidate)
   - Todos los scores y feedback relacionados

### Ventajas
- **Consistencia**: No hay datos residuales de versiones anteriores
- **Rendimiento**: Consultas más rápidas sin datos obsoletos
- **Simplicidad**: Lógica de reemplazo clara y predecible

## Consideraciones de Rendimiento

### Índices Críticos
- `[datasetId, tIdx]` - Para cálculos de rectas y algoritmos ML
- `[datasetId, time]` - Para consultas temporales y rangos
- `[symbol, timeframe]` - Para identificación rápida de datasets

### Optimizaciones
- **Decimal(20,8)**: Precisión suficiente para precios sin overhead
- **Timestamptz(6)**: Timestamps UTC con precisión de microsegundos
- **CASCADE DELETE**: Eliminación eficiente de datos relacionados

### Consultas Típicas
```sql
-- Obtener velas de un dataset
SELECT * FROM Candle WHERE datasetId = ? ORDER BY tIdx;

-- Buscar candidatos de soporte
SELECT * FROM LineCandidate WHERE datasetId = ? AND type = 'SUPPORT';

-- Obtener scores más recientes
SELECT * FROM LineScore WHERE candidateId = ? ORDER BY createdAt DESC;
```

## DTOs y Tipos

### Timeframe
```typescript
enum Timeframe {
  D1,   // Diario
  H4,   // 4 horas
  H1,   // 1 hora
  M15,  // 15 minutos
  M5    // 5 minutos
}
```

### LineType
```typescript
enum LineType {
  SUPPORT,   // Línea de soporte
  RESIST,    // Línea de resistencia
  CHANNEL    // Canal (paralelo)
}
```

### FeedbackLabel
```typescript
enum FeedbackLabel {
  GOOD,      // Línea buena
  BAD        // Línea mala
}
```

## Migraciones y Desarrollo

### Comandos Principales
```bash
# Generar cliente Prisma
npm run prisma:generate

# Crear y aplicar migración
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio
```

### Flujo de Desarrollo
1. **Modificar schema.prisma**
2. **Ejecutar `npm run prisma:generate`**
3. **Ejecutar `npm run prisma:migrate`**
4. **Verificar cambios en Prisma Studio**

## Próximos Pasos

- [ ] Implementar lógica de upload CSV
- [ ] Crear endpoints para líneas de tendencia
- [ ] Implementar sistema de scoring ML
- [ ] Agregar autenticación para feedback
- [ ] Crear índices adicionales según patrones de uso
