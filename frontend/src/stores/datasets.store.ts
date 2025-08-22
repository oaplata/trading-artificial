import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { datasetsApi, type Dataset, type Candle, type ListDatasetsParams } from '../api/datasets';

export const useDatasetsStore = defineStore('datasets', () => {
  // State
  const datasets = ref<Dataset[]>([]);
  const currentDataset = ref<Dataset | null>(null);
  const currentCandles = ref<Candle[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(20);
  const total = ref(0);
  
  // Filters
  const symbolFilter = ref('');
  const timeframeFilter = ref('');
  const orderBy = ref<'uploadedAt_desc' | 'uploadedAt_asc'>('uploadedAt_desc');

  // Getters
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value));
  const hasNextPage = computed(() => currentPage.value < totalPages.value);
  const hasPrevPage = computed(() => currentPage.value > 1);

  // Actions
  const fetchDatasets = async (params: ListDatasetsParams = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await datasetsApi.listDatasets({
        page: currentPage.value,
        pageSize: pageSize.value,
        symbol: symbolFilter.value || undefined,
        timeframe: timeframeFilter.value || undefined,
        order: orderBy.value,
        ...params,
      });
      
      datasets.value = response.items;
      total.value = response.total;
      currentPage.value = response.page;
      pageSize.value = response.pageSize;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar datasets';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCandles = async (datasetId: string) => {
    console.log('fetchCandles called with:', datasetId);
    loading.value = true;
    error.value = null;
    
    try {
      console.log('Calling API getCandlesByDataset...');
      const response = await datasetsApi.getCandlesByDataset(datasetId);
      console.log('API response:', response);
      currentDataset.value = response.dataset;
      currentCandles.value = response.candles;
      console.log('Store updated - dataset:', response.dataset, 'candles:', response.candles.length);
    } catch (err) {
      console.error('Error in fetchCandles:', err);
      error.value = err instanceof Error ? err.message : 'Error al cargar velas';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const uploadCsv = async (file: File, symbol?: string, timeframe?: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await datasetsApi.uploadCsv(file, symbol, timeframe);
      
      // Refresh datasets list
      await fetchDatasets();
      
      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al subir CSV';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setPage = (page: number) => {
    currentPage.value = page;
    fetchDatasets();
  };

  const setPageSize = (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchDatasets();
  };

  const setSymbolFilter = (symbol: string) => {
    symbolFilter.value = symbol;
    currentPage.value = 1;
    fetchDatasets();
  };

  const setTimeframeFilter = (timeframe: string) => {
    timeframeFilter.value = timeframe;
    currentPage.value = 1;
    fetchDatasets();
  };

  const setOrderBy = (order: 'uploadedAt_desc' | 'uploadedAt_asc') => {
    orderBy.value = order;
    fetchDatasets();
  };

  const clearFilters = () => {
    symbolFilter.value = '';
    timeframeFilter.value = '';
    currentPage.value = 1;
    fetchDatasets();
  };

  const reset = () => {
    datasets.value = [];
    currentDataset.value = null;
    currentCandles.value = [];
    loading.value = false;
    error.value = null;
    currentPage.value = 1;
    total.value = 0;
    symbolFilter.value = '';
    timeframeFilter.value = '';
    orderBy.value = 'uploadedAt_desc';
  };

  return {
    // State
    datasets,
    currentDataset,
    currentCandles,
    loading,
    error,
    currentPage,
    pageSize,
    total,
    symbolFilter,
    timeframeFilter,
    orderBy,
    
    // Getters
    totalPages,
    hasNextPage,
    hasPrevPage,
    
    // Actions
    fetchDatasets,
    fetchCandles,
    uploadCsv,
    setPage,
    setPageSize,
    setSymbolFilter,
    setTimeframeFilter,
    setOrderBy,
    clearFilters,
    reset,
  };
});
