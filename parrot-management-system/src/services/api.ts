import axios, { type AxiosInstance } from 'axios';

// 根据环境自动选择 API 地址
const getBaseURL = () => {
  // 生产环境使用环境变量或当前域名
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
  }
  // 开发环境使用本地地址
  return 'http://localhost:8000/api';
};

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: getBaseURL(),
      timeout: 30000, // 生产环境可能需要更长超时（Render 冷启动）
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 可以在这里添加认证token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
          // 未授权处理
          console.error('Unauthorized, redirecting to login...');
        } else if (error.code === 'ECONNABORTED') {
          console.error('Request timeout');
        } else if (error.message === 'Network Error') {
          console.error('Network error - check if backend is running');
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any) {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any) {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any) {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string, config?: any) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async uploadFile(url: string, file: File, parrotId?: number) {
    const formData = new FormData();
    formData.append('file', file);
    if (parrotId) {
      formData.append('parrot_id', parrotId.toString());
    }

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 上传文件超时设置为10分钟
    });

    return response.data;
  }
}

export const api = new ApiService();
