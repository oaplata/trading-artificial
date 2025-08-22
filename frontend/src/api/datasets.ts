import { apiClient } from './client';

export interface Dataset {
  id: string;
  symbol: string;
  timeframe: string;
  rows: number;
  uploadedAt: string;
}

export interface ListDatasetsResponse {
  items: Dataset[];
  page: number;
  pageSize: number;
  total: number;
}

export interface Candle {
  time: number; // epoch ms
  open: number;
  high: number;
  low: number;
  close: number;
  tIdx: number;
}

export interface GetCandlesResponse {
  dataset: Dataset;
  candles: Candle[];
}

export interface UploadCsvResponse {
  datasetId: string;
  symbol: string;
  timeframe: string;
  rows: number;
  sourceFile: string;
}

export interface ListDatasetsParams {
  symbol?: string;
  timeframe?: string;
  page?: number;
  pageSize?: number;
  order?: 'uploadedAt_desc' | 'uploadedAt_asc';
}

export interface GetCandlesParams {
  fromTime?: string;
  toTime?: string;
  limit?: number;
}

export const datasetsApi = {
  // Listar datasets con paginación y filtros
  async listDatasets(params: ListDatasetsParams = {}): Promise<ListDatasetsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.symbol) queryParams.append('symbol', params.symbol);
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.order) queryParams.append('order', params.order);

    const endpoint = `/data/datasets?${queryParams.toString()}`;
    const response = await apiClient.get<ListDatasetsResponse>(endpoint);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },

  // Obtener velas de un dataset
  async getCandlesByDataset(datasetId: string, params: GetCandlesParams = {}): Promise<GetCandlesResponse> {
    console.log('getCandlesByDataset called with:', datasetId, params);
    const queryParams = new URLSearchParams();
    
    if (params.fromTime) queryParams.append('fromTime', params.fromTime);
    if (params.toTime) queryParams.append('toTime', params.toTime);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/data/datasets/${datasetId}/candles?${queryParams.toString()}`;
    console.log('API endpoint:', endpoint);
    const response = await apiClient.get<GetCandlesResponse>(endpoint);
    console.log('API raw response:', response);
    
    if (response.error) {
      console.error('API error:', response.error);
      throw new Error(response.error);
    }
    
    console.log('API data:', response.data);
    return response.data!;
  },

  // Upload CSV
  async uploadCsv(file: File, symbol?: string, timeframe?: string): Promise<UploadCsvResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const queryParams = new URLSearchParams();
    if (symbol) queryParams.append('symbol', symbol);
    if (timeframe) queryParams.append('timeframe', timeframe);
    
    const endpoint = `/data/upload-csv?${queryParams.toString()}`;
    const response = await apiClient.postFormData<UploadCsvResponse>(endpoint, formData);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  },
};
