<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {{ currentDataset?.symbol || 'Cargando...' }} - {{ currentDataset?.timeframe || '' }}
          </h1>
          <p class="text-gray-600">
            {{ currentDataset?.rows?.toLocaleString() || 0 }} velas OHLC
          </p>
        </div>
        
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            ← Volver a Datasets
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div class="flex items-center justify-center space-x-2">
        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-lg text-gray-600">Cargando datos del gráfico...</span>
      </div>
      <div class="mt-4 text-sm text-gray-500">
        <p>Dataset ID: {{ datasetId }}</p>
        <p>Loading: {{ loading }}</p>
        <p>Error: {{ error }}</p>
        <p>Candles: {{ currentCandles.length }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error al cargar el gráfico</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          <div class="mt-4">
            <button
              @click="retryLoad"
              class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráfico -->
    <div v-else-if="currentDataset && currentCandles.length > 0" class="space-y-6">
      <!-- Información del dataset -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div class="text-sm text-gray-500">Símbolo</div>
            <div class="text-lg font-semibold text-gray-900">{{ currentDataset.symbol }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Timeframe</div>
            <div class="text-lg font-semibold text-gray-900">{{ currentDataset.timeframe }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Total de velas</div>
            <div class="text-lg font-semibold text-gray-900">{{ currentDataset.rows.toLocaleString() }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Subido</div>
            <div class="text-lg font-semibold text-gray-900">{{ formatDate(new Date(currentDataset.uploadedAt)) }}</div>
          </div>
        </div>
        
        <!-- Estadísticas de precios -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Estadísticas de Precios</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div class="text-xs text-gray-500">Precio más alto</div>
              <div class="text-sm font-semibold text-green-600">
                ${{ Math.max(...currentCandles.map(c => c.high)).toFixed(2) }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Precio más bajo</div>
              <div class="text-sm font-semibold text-red-600">
                ${{ Math.min(...currentCandles.map(c => c.low)).toFixed(2) }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Precio de apertura</div>
              <div class="text-sm font-semibold text-gray-900">
                ${{ currentCandles[0]?.open.toFixed(2) }}
              </div>
            </div>
            <div>
              <div class="text-xs text-gray-500">Precio de cierre</div>
              <div class="text-sm font-semibold text-gray-900">
                ${{ currentCandles[currentCandles.length - 1]?.close.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenedor del gráfico -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="mb-4">
          <h3 class="text-lg font-medium text-gray-900">Gráfico de Velas OHLC</h3>
          <p class="text-sm text-gray-500">
            Datos desde {{ formatDate(new Date(currentCandles[0]?.time)) }} hasta {{ formatDate(new Date(currentCandles[currentCandles.length - 1]?.time)) }}
          </p>
          <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            <div class="flex items-center space-x-1">
              <div class="w-3 h-3 bg-green-500 rounded"></div>
              <span>Velas alcistas</span>
            </div>
            <div class="flex items-center space-x-1">
              <div class="w-3 h-3 bg-red-500 rounded"></div>
              <span>Velas bajistas</span>
            </div>
          </div>
        </div>
        
        <div ref="chartContainer" class="w-full h-96 bg-gray-50 rounded-lg"></div>
      </div>
    </div>

    <!-- Sin datos -->
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div class="text-4xl mb-4">📊</div>
      <div class="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</div>
      <div class="text-gray-500">El dataset no contiene velas para mostrar</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDatasetsStore } from '@/stores/datasets.store';
import { storeToRefs } from 'pinia';
import { createChart, type IChartApi, type ISeriesApi, type CandlestickData } from 'lightweight-charts';

const route = useRoute();
const router = useRouter();
const datasetsStore = useDatasetsStore();

const chartContainer = ref<HTMLDivElement>();
const chart = ref<IChartApi>();
const candlestickSeries = ref<ISeriesApi<'Candlestick'>>();

// Usar el store directamente para debugging
// const {
//   currentDataset,
//   currentCandles,
//   loading,
//   error,
// } = storeToRefs(datasetsStore);

// Acceder directamente al store
const currentDataset = computed(() => datasetsStore.currentDataset);
const currentCandles = computed(() => datasetsStore.currentCandles);
const loading = computed(() => datasetsStore.loading);
const error = computed(() => datasetsStore.error);
const { fetchCandles } = datasetsStore;

const datasetId = computed(() => route.params.id as string);

const goBack = () => {
  router.push('/data');
};

const retryLoad = () => {
  if (datasetId.value) {
    fetchCandles(datasetId.value);
  }
};

const formatDate = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const initChart = () => {
  console.log('initChart called, container:', !!chartContainer.value, 'candles:', currentCandles.value.length);
  if (!chartContainer.value || !currentCandles.value.length) return;

  // Limpiar gráfico anterior
  if (chart.value) {
    chart.value.remove();
    chart.value = undefined;
  }
  if (candlestickSeries.value) {
    candlestickSeries.value = undefined;
  }

  // Crear nuevo gráfico
  chart.value = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: chartContainer.value.clientHeight,
    layout: {
      background: { color: '#ffffff' },
      textColor: '#333',
    },
    grid: {
      vertLines: { color: '#f0f0f0' },
      horzLines: { color: '#f0f0f0' },
    },
    crosshair: {
      mode: 1,
      vertLine: {
        color: '#2563eb',
        width: 1,
        style: 2,
        labelBackgroundColor: '#2563eb',
      },
      horzLine: {
        color: '#2563eb',
        width: 1,
        style: 2,
        labelBackgroundColor: '#2563eb',
      },
    },
    rightPriceScale: {
      borderColor: '#cccccc',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    timeScale: {
      borderColor: '#cccccc',
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 12,
      barSpacing: 3,
      minBarSpacing: 2,
    },
  });

  // Crear serie de velas OHLC
  candlestickSeries.value = chart.value.addCandlestickSeries({
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderVisible: false,
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
  });

  // Preparar datos para el gráfico de velas
  const chartData: CandlestickData[] = currentCandles.value.map(candle => ({
    time: (candle.time / 1000) as any, // Convertir de ms a segundos para Lightweight-Charts
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  }));

  // Establecer datos
  candlestickSeries.value.setData(chartData);

  // Ajustar escala de tiempo
  chart.value.timeScale().fitContent();
};

const handleResize = () => {
  if (chart.value && chartContainer.value) {
    chart.value.applyOptions({
      width: chartContainer.value.clientWidth,
      height: chartContainer.value.clientHeight,
    });
    
    // Ajustar la escala de tiempo después del resize
    setTimeout(() => {
      chart.value?.timeScale().fitContent();
    }, 100);
  }
};

// Cargar datos al montar
onMounted(async () => {
  console.log('DatasetChart mounted, datasetId:', datasetId.value);
  console.log('Initial loading state:', loading.value);
  
  if (datasetId.value) {
    console.log('Fetching candles for:', datasetId.value);
    try {
      await fetchCandles(datasetId.value);
      console.log('Fetch completed, loading state:', loading.value);
      console.log('Current candles length:', currentCandles.value.length);
      console.log('Current dataset:', currentDataset.value);
    } catch (error) {
      console.error('Error fetching candles:', error);
    }
  }
  
  // Inicializar gráfico cuando los datos estén disponibles
  if (currentCandles.value.length > 0) {
    console.log('Initial chart with', currentCandles.value.length, 'candles');
    initChart();
  }
  
  // Manejar resize
  window.addEventListener('resize', handleResize);
});

// Watcher para cuando los datos cambien
watch(currentCandles, () => {
  console.log('Candles changed, length:', currentCandles.value.length);
  if (currentCandles.value.length > 0) {
    nextTick(() => {
      console.log('Initializing chart...');
      initChart();
    });
  }
}, { deep: true });

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (chart.value) {
    chart.value.remove();
    chart.value = undefined;
  }
  if (candlestickSeries.value) {
    candlestickSeries.value = undefined;
  }
});
</script>
