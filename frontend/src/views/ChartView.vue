<template>
  <div class="space-y-6">
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Gráfico de Precios</h2>
        <div class="flex space-x-2">
          <button class="btn btn-secondary">1H</button>
          <button class="btn btn-secondary">4H</button>
          <button class="btn btn-primary">1D</button>
          <button class="btn btn-secondary">1W</button>
        </div>
      </div>
      
      <div class="relative">
        <div ref="chartContainer" class="w-full h-96 bg-gray-900 rounded-lg"></div>
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
          <div class="text-white">Cargando gráfico...</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Líneas de Tendencia Detectadas</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div class="font-medium text-green-800">Soporte</div>
              <div class="text-sm text-green-600">$42,150</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-green-800">95%</div>
              <div class="text-xs text-green-600">Confianza</div>
            </div>
          </div>
          <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div>
              <div class="font-medium text-red-800">Resistencia</div>
              <div class="text-sm text-red-600">$44,800</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-red-800">87%</div>
              <div class="text-xs text-red-600">Confianza</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Precio Actual</span>
            <span class="font-medium">$43,250</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Cambio 24h</span>
            <span class="font-medium text-green-600">+2.45%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Volumen 24h</span>
            <span class="font-medium">$1.2B</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Market Cap</span>
            <span class="font-medium">$850B</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createChart, IChartApi, ISeriesApi, LineData } from 'lightweight-charts'

const chartContainer = ref<HTMLDivElement>()
const chart = ref<IChartApi>()
const lineSeries = ref<ISeriesApi<'Line'>>()
const loading = ref(true)

const generateMockData = (): LineData[] => {
  const data: LineData[] = []
  let price = 42000
  const now = Math.floor(Date.now() / 1000)
  
  for (let i = 0; i < 100; i++) {
    const time = now - (100 - i) * 24 * 60 * 60 // Últimos 100 días
    price += (Math.random() - 0.5) * 1000 // Variación aleatoria
    data.push({
      time,
      value: Math.max(price, 35000) // Precio mínimo
    })
  }
  
  return data
}

onMounted(() => {
  if (!chartContainer.value) return

  // Crear gráfico
  chart.value = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: 400,
    layout: {
      background: { color: '#1e293b' },
      textColor: '#e2e8f0',
    },
    grid: {
      vertLines: { color: '#334155' },
      horzLines: { color: '#334155' },
    },
    crosshair: {
      mode: 1,
    },
    rightPriceScale: {
      borderColor: '#334155',
    },
    timeScale: {
      borderColor: '#334155',
      timeVisible: true,
    },
  })

  // Crear serie de líneas
  lineSeries.value = chart.value.addLineSeries({
    color: '#3b82f6',
    lineWidth: 2,
  })

  // Agregar datos mock
  const mockData = generateMockData()
  lineSeries.value.setData(mockData)

  // Responsive
  const resizeObserver = new ResizeObserver(() => {
    if (chart.value && chartContainer.value) {
      chart.value.applyOptions({
        width: chartContainer.value.clientWidth,
      })
    }
  })

  if (chartContainer.value) {
    resizeObserver.observe(chartContainer.value)
  }

  loading.value = false
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.remove()
  }
})
</script>
