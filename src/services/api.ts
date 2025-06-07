import { TemHumData, CalidadAguaData, HistoryResponse, StatsResponse, ChartResponse } from '../types';

const BASE_URL = 'https://proyectos-iot.onrender.com';

type TableType = 'temhum1' | 'temhum2' | 'calidad_agua';

interface ApiError extends Error {
  status?: number;
}

const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'Error en la solicitud';
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorMessage;
  } catch (e) {
    // Si no podemos parsear el error, usamos el mensaje por defecto
  }
  
  const error: ApiError = new Error(errorMessage);
  error.status = response.status;
  console.error('API Error:', error);
  throw error;
};

const fetchFromApi = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return handleApiError(response);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network error:', error);
    throw new Error('Error de conexión con el servidor');
  }
};

export class ApiService {
  /**
   * Obtiene el último registro de una tabla específica
   * @param table Nombre de la tabla (temhum1, temhum2, calidad_agua)
   */
  static async getLatestData(table: TableType): Promise<TemHumData | CalidadAguaData> {
    return fetchFromApi(`/api/latest/${table}`);
  }

  /**
   * Obtiene datos históricos de una tabla específica con paginación
   * @param table Nombre de la tabla (temhum1, temhum2, calidad_agua)
   * @param page Número de página (por defecto: 1)
   * @param limit Cantidad de registros por página (por defecto: 100)
   * @param hours Últimas N horas a consultar (opcional)
   */
  static async getHistory(
    table: TableType,
    page: number = 1,
    limit: number = 100,
    hours?: number
  ): Promise<HistoryResponse> {
    let url = `/api/history/${table}?page=${page}&limit=${limit}`;
    if (hours) {
      const now = new Date();
      const fromDate = new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
      url += `&from=${encodeURIComponent(fromDate)}`;
    }
    return fetchFromApi(url);
  }

  /**
   * Obtiene datos para gráficos de una tabla específica
   * @param table Nombre de la tabla (temhum1, temhum2, calidad_agua)
   */
  static async getChartData(table: TableType): Promise<ChartResponse> {
    return fetchFromApi(`/api/chart/${table}`);
  }

  /**
   * Obtiene estadísticas de los últimos 7 días
   * @param table Nombre de la tabla (solo temhum1 o temhum2)
   */
  static async getStats(table: 'temhum1' | 'temhum2'): Promise<StatsResponse> {
    return fetchFromApi(`/api/stats/${table}`);
  }

  /**
   * Verifica si la API está disponible
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Obtiene datos de estadísticas para una tabla específica
   * @param table Nombre de la tabla (temhum1 o temhum2)
   */
  static async getStatsData(table: 'temhum1' | 'temhum2'): Promise<StatsResponse> {
    return this.getStats(table);
  }

  /**
   * Verifica si la API está disponible
   * @deprecated Usar checkHealth en su lugar
   */
  static async getApiStatus(): Promise<boolean> {
    return this.checkHealth();
  }
}