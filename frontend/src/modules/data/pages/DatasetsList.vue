<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Datasets</h1>
      <p class="text-gray-600">
        Lista de datasets disponibles para análisis de líneas de tendencia
      </p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Buscar por símbolo
          </label>
          <input
            v-model="symbolFilter"
            type="text"
            placeholder="SPY, BTC, AAPL..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="handleSymbolFilterChange"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Timeframe
          </label>
          <select
            v-model="timeframeFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="handleTimeframeFilterChange"
          >
            <option value="">Todos</option>
            <option value="D1">D1 - Diario</option>
            <option value="H4">H4 - 4 Horas</option>
            <option value="H1">H1 - 1 Hora</option>
            <option value="M15">M15 - 15 Minutos</option>
            <option value="M5">M5 - 5 Minutos</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            v-model="orderBy"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="handleOrderChange"
          >
            <option value="uploadedAt_desc">Más reciente primero</option>
            <option value="uploadedAt_asc">Más antiguo primero</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de datasets -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Símbolo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeframe
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filas
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subido
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-4 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-gray-600">Cargando datasets...</span>
                </div>
              </td>
            </tr>
            
            <tr v-else-if="datasets.length === 0" class="hover:bg-gray-50">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                <div class="text-4xl mb-2">📊</div>
                <div class="text-lg font-medium">No hay datasets disponibles</div>
                <div class="text-sm">Sube tu primer archivo CSV para comenzar</div>
              </td>
            </tr>
            
            <tr
              v-else
              v-for="dataset in datasets"
              :key="dataset.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ dataset.symbol }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ dataset.timeframe }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ dataset.rows.toLocaleString() }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(dataset.uploadedAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="viewChart(dataset.id)"
                  class="text-blue-600 hover:text-blue-900 font-medium hover:underline"
                >
                  Ver Gráfico
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="total > 0" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="setPage(currentPage - 1)"
            :disabled="!hasPrevPage"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            @click="setPage(currentPage + 1)"
            :disabled="!hasNextPage"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando
              <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
              a
              <span class="font-medium">{{ Math.min(currentPage * pageSize, total) }}</span>
              de
              <span class="font-medium">{{ total }}</span>
              resultados
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="setPage(currentPage - 1)"
                :disabled="!hasPrevPage"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Anterior</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="setPage(page)"
                :class="[
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
              >
                {{ page }}
              </button>
              
              <button
                @click="setPage(currentPage + 1)"
                :disabled="!hasNextPage"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Siguiente</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error al cargar datasets</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDatasetsStore } from '@/stores/datasets.store';
import { storeToRefs } from 'pinia';
import type { Dataset } from '@/api/datasets';

const router = useRouter();
const datasetsStore = useDatasetsStore();

// Usar storeToRefs para mantener la reactividad
const {
  datasets,
  loading,
  error,
  currentPage,
  pageSize,
  total,
  symbolFilter,
  timeframeFilter,
  orderBy,
  hasNextPage,
  hasPrevPage,
  totalPages,
} = storeToRefs(datasetsStore);

// Computed para páginas visibles
const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Handlers
const handleSymbolFilterChange = () => {
  datasetsStore.setSymbolFilter(symbolFilter.value);
};

const handleTimeframeFilterChange = () => {
  datasetsStore.setTimeframeFilter(timeframeFilter.value);
};

const handleOrderChange = () => {
  datasetsStore.setOrderBy(orderBy.value);
};

const clearFilters = () => {
  datasetsStore.clearFilters();
};

const setPage = (page: number) => {
  datasetsStore.setPage(page);
};

const viewChart = (datasetId: string) => {
  router.push(`/data/${datasetId}`);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Cargar datasets al montar
onMounted(() => {
  datasetsStore.fetchDatasets();
});

// Watchers para filtros
watch(() => symbolFilter.value, () => {
  handleSymbolFilterChange();
}, { immediate: false });

watch(() => timeframeFilter.value, () => {
  handleTimeframeFilterChange();
}, { immediate: false });

watch(() => orderBy.value, () => {
  handleOrderChange();
}, { immediate: false });
</script>
