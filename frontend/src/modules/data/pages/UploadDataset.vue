<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Subir Dataset CSV</h1>
      <p class="text-gray-600">
        Sube archivos CSV con datos OHLC para análisis de líneas de tendencia
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <!-- File Dropzone -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Archivo CSV
        </label>
        <FileDropzone
          @file-selected="handleFileSelected"
          @file-removed="handleFileRemoved"
        />
      </div>

      <!-- Campos opcionales -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Símbolo <span class="text-red-500">*</span>
          </label>
          <input
            v-model="symbol"
            type="text"
            placeholder="SPY, BTC, AAPL..."
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'border-red-300': symbolError }"
          />
          <p v-if="symbolError" class="text-xs text-red-500 mt-1">
            {{ symbolError }}
          </p>
          <p v-else class="text-xs text-gray-500 mt-1">
            Símbolo del instrumento financiero
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Timeframe <span class="text-red-500">*</span>
          </label>
          <select
            v-model="timeframe"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'border-red-300': timeframeError }"
          >
            <option value="">Selecciona un timeframe</option>
            <option value="D1">D1 - Diario</option>
            <option value="H4">H4 - 4 Horas</option>
            <option value="H1">H1 - 1 Hora</option>
            <option value="M15">M15 - 15 Minutos</option>
            <option value="M5">M5 - 5 Minutos</option>
          </select>
          <p v-if="timeframeError" class="text-xs text-red-500 mt-1">
            {{ timeframeError }}
          </p>
          <p v-else class="text-xs text-gray-500 mt-1">
            Intervalo de tiempo de las velas
          </p>
        </div>
      </div>

      <!-- Botón de upload -->
      <div class="flex justify-end">
        <button
          @click="handleUpload"
          :disabled="!canUpload || uploading"
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="uploading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Subiendo...
          </span>
          <span v-else>Subir Dataset</span>
        </button>
      </div>
      
      <!-- Información de formato -->
      <div class="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 class="text-sm font-medium text-blue-800 mb-2">Formato requerido del CSV:</h4>
        <div class="text-xs text-blue-700 space-y-1">
          <p>• Primera fila: Headers (time, open, high, low, close)</p>
          <p>• Columna 'time': Timestamp en formato ISO 8601 o epoch milliseconds</p>
          <p>• Columnas 'open', 'high', 'low', 'close': Precios numéricos</p>
          <p>• Ejemplo: <code class="bg-blue-100 px-1 rounded">2024-01-01T00:00:00Z,100.50,101.20,100.00,100.80</code></p>
        </div>
      </div>
    </div>

    <!-- Resultado del upload -->
    <div v-if="uploadResult" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <div class="text-center">
        <div class="text-6xl text-green-500 mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">¡Dataset subido exitosamente!</h2>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div class="text-sm text-gray-500">Símbolo</div>
              <div class="text-lg font-semibold text-gray-900">{{ uploadResult.symbol }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Timeframe</div>
              <div class="text-lg font-semibold text-gray-900">{{ uploadResult.timeframe }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Filas</div>
              <div class="text-lg font-semibold text-gray-900">{{ uploadResult.rows.toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Archivo</div>
              <div class="text-lg font-semibold text-gray-900">{{ uploadResult.sourceFile }}</div>
            </div>
          </div>
        </div>

        <div class="flex justify-center space-x-4">
          <button
            @click="viewChart"
            class="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Ver Gráfico
          </button>
          <button
            @click="uploadAnother"
            class="px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Subir Otro
          </button>
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
          <h3 class="text-sm font-medium text-red-800">Error al subir archivo</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDatasetsStore } from '@/stores/datasets.store';
import FileDropzone from '@/components/commons/FileDropzone.vue';
import type { UploadCsvResponse } from '@/api/datasets';

const router = useRouter();
const datasetsStore = useDatasetsStore();

const selectedFile = ref<File | null>(null);
const symbol = ref('');
const timeframe = ref('');
const uploading = ref(false);
const uploadResult = ref<UploadCsvResponse | null>(null);
const error = ref('');
const symbolError = ref('');
const timeframeError = ref('');

// Computed para validar si se puede hacer upload
const canUpload = computed(() => {
  return selectedFile.value && symbol.value.trim() && timeframe.value && !symbolError.value && !timeframeError.value;
});

const validateSymbol = () => {
  if (!symbol.value.trim()) {
    symbolError.value = 'El símbolo es requerido';
    return false;
  }
  if (symbol.value.trim().length < 2) {
    symbolError.value = 'El símbolo debe tener al menos 2 caracteres';
    return false;
  }
  symbolError.value = '';
  return true;
};

const validateTimeframe = () => {
  if (!timeframe.value) {
    timeframeError.value = 'El timeframe es requerido';
    return false;
  }
  timeframeError.value = '';
  return true;
};

const handleFileSelected = (file: File) => {
  selectedFile.value = file;
  error.value = '';
  uploadResult.value = null;
};

const handleFileRemoved = () => {
  selectedFile.value = null;
  error.value = '';
  uploadResult.value = null;
};

const handleUpload = async () => {
  if (!selectedFile.value) return;

  // Validar campos antes de hacer upload
  const isSymbolValid = validateSymbol();
  const isTimeframeValid = validateTimeframe();

  if (!isSymbolValid || !isTimeframeValid) {
    return;
  }

  uploading.value = true;
  error.value = '';
  uploadResult.value = null;

  try {
    const result = await datasetsStore.uploadCsv(
      selectedFile.value,
      symbol.value.trim(),
      timeframe.value
    );
    
    uploadResult.value = result;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    uploading.value = false;
  }
};

const viewChart = () => {
  if (uploadResult.value) {
    router.push(`/data/${uploadResult.value.datasetId}`);
  }
};

const uploadAnother = () => {
  selectedFile.value = null;
  symbol.value = '';
  timeframe.value = '';
  uploadResult.value = null;
  error.value = '';
  symbolError.value = '';
  timeframeError.value = '';
};

// Watchers para validación en tiempo real
watch(symbol, () => {
  if (symbol.value) {
    validateSymbol();
  }
});

watch(timeframe, () => {
  if (timeframe.value) {
    validateTimeframe();
  }
});
</script>
