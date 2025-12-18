import { api } from './api';

export interface IncubationRecord {
  id: number;
  father_id: number;
  mother_id: number;
  start_date: string;
  expected_hatch_date: string;
  actual_hatch_date?: string;
  eggs_count: number;
  hatched_count: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  father: {
    id: number;
    breed: string;
    ring_number?: string;
    gender: string;
  };
  mother: {
    id: number;
    breed: string;
    ring_number?: string;
    gender: string;
  };
}

export interface IncubationRecordCreate {
  father_id: number;
  mother_id: number;
  start_date: string;
  expected_hatch_date: string;
  actual_hatch_date?: string;
  eggs_count: number;
  hatched_count: number;
  status: string;
  notes?: string;
}

export interface IncubationRecordUpdate {
  father_id?: number;
  mother_id?: number;
  start_date?: string;
  expected_hatch_date?: string;
  actual_hatch_date?: string;
  eggs_count?: number;
  hatched_count?: number;
  status?: string;
  notes?: string;
}

export interface IncubationFilterParams {
  status?: string;
  start_date_from?: string;
  start_date_to?: string;
  father_ring_number?: string;
  mother_ring_number?: string;
  page?: number;
  size?: number;
}

export interface PaginatedIncubationData {
  total: number;
  items: IncubationRecord[];
  page: number;
  size: number;
}

export interface IncubationStatistics {
  total_records: number;
  incubating_count: number;
  hatched_count: number;
  failed_count: number;
  total_eggs: number;
  total_hatched: number;
  hatch_rate: number;
}

export class IncubationService {
  /**
   * 获取孵化记录列表
   */
  static async getIncubationRecords(params?: IncubationFilterParams) {
    const data = await api.get<PaginatedIncubationData>('/incubation', params);
    return { success: true, data };
  }

  /**
   * 获取孵化记录详情
   */
  static async getIncubationRecord(id: number) {
    const data = await api.get<IncubationRecord>(`/incubation/${id}`);
    return { success: true, data };
  }

  /**
   * 创建孵化记录
   */
  static async createIncubationRecord(formData: IncubationRecordCreate) {
    const data = await api.post<IncubationRecord>('/incubation', formData);
    return { success: true, data: { record: data } };
  }

  /**
   * 更新孵化记录
   */
  static async updateIncubationRecord(id: number, formData: IncubationRecordUpdate) {
    const data = await api.put<IncubationRecord>(`/incubation/${id}`, formData);
    return { success: true, data: { record: data } };
  }

  /**
   * 删除孵化记录
   */
  static async deleteIncubationRecord(id: number) {
    await api.delete(`/incubation/${id}`);
    return { success: true };
  }

  /**
   * 获取孵化统计信息
   */
  static async getIncubationStatistics() {
    const data = await api.get<IncubationStatistics>('/incubation/statistics/summary');
    return { success: true, data };
  }
}
