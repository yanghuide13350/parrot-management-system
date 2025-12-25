import { api } from './api';
import type { Parrot, ParrotFormData, FilterParams, PaginatedData, Statistics, Photo } from '../types/parrot';
import type {
  SaleRecord,
  SalesHistoryRecord,
  FollowUpRecord,
  SalesFilterParams,
  SalesStatistics,
  SalesTimelineEvent,
} from '../types/parrot';

export class ParrotService {
  static async getParrots(params?: FilterParams) {
    const data = await api.get<PaginatedData<Parrot>>('/parrots', params);
    return { success: true, data };
  }

  static async getParrot(id: number) {
    const data = await api.get<Parrot>(`/parrots/${id}`);
    return { success: true, data };
  }

  static async createParrot(formData: ParrotFormData) {
    const data = await api.post<Parrot>('/parrots', formData);
    return { success: true, data: { parrot: data } };
  }

  static async updateParrot(id: number, formData: Partial<ParrotFormData>) {
    const data = await api.put<Parrot>(`/parrots/${id}`, formData);
    return { success: true, data: { parrot: data } };
  }

  static async deleteParrot(id: number) {
    await api.delete(`/parrots/${id}`);
    return { success: true };
  }

  static async updateStatus(id: number, status: string) {
    const data = await api.put<Parrot>(`/parrots/${id}/status`, { status });
    return { success: true, data };
  }

  static async getPhotos(parrotId: number) {
    const data = await api.get<Photo[]>(`/parrots/${parrotId}/photos`);
    return { success: true, data };
  }

  static async uploadPhoto(parrotId: number, file: File) {
    const data = await api.uploadFile(`/parrots/${parrotId}/photos`, file);
    return { success: true, data };
  }

  static async getStatistics() {
    const data = await api.get<Statistics>('/statistics');
    return { success: true, data };
  }

  static async getBreeds() {
    // 从统计信息中提取品种列表
    const data = await api.get<Statistics>('/statistics');
    const breeds = Object.entries(data.breed_counts).map(([name, count]) => ({
      name,
      count: count as number,
    }));
    return { success: true, data: breeds };
  }

  // ==================== 销售相关API ====================

  /**
   * 获取销售记录列表（当前在售鹦鹉，status=sold）
   */
  static async getSalesRecords(params?: SalesFilterParams) {
    const data = await api.get<PaginatedData<SaleRecord>>('/sales-records', params);
    return { success: true, data };
  }

  /**
   * 获取销售历史记录（SalesHistory表）
   */
  static async getSalesHistory(params?: SalesFilterParams) {
    const data = await api.get<PaginatedData<SalesHistoryRecord>>('/sales-history', params);
    return { success: true, data };
  }

  /**
   * 获取鹦鹉的销售信息
   */
  static async getParrotSaleInfo(parrotId: number) {
    const data = await api.get<SaleRecord>(`/parrots/${parrotId}/sale-info`);
    return { success: true, data };
  }

  /**
   * 更新鹦鹉的销售信息
   */
  static async updateParrotSaleInfo(
    parrotId: number,
    saleInfo: {
      seller: string;
      buyer_name: string;
      sale_price: number;
      contact: string;
      follow_up_status?: string;
      notes?: string;
      payment_method?: string;
    }
  ) {
    const data = await api.put<SaleRecord>(`/parrots/${parrotId}/sale-info`, saleInfo);
    return { success: true, data };
  }

  /**
   * 处理退货
   */
  static async processReturn(parrotId: number, returnReason: string) {
    const data = await api.put(`/parrots/${parrotId}/return`, { return_reason: returnReason });
    return { success: true, data };
  }

  /**
   * 获取回访记录
   */
  static async getFollowUps(parrotId: number, params?: { page?: number; pageSize?: number }) {
    const data = await api.get<PaginatedData<FollowUpRecord>>(`/parrots/${parrotId}/follow-ups`, params);
    return { success: true, data };
  }

  /**
   * 创建回访记录
   */
  static async createFollowUp(
    parrotId: number,
    followUp: {
      follow_up_status: string;
      notes: string;
    }
  ) {
    const data = await api.post<FollowUpRecord>(`/parrots/${parrotId}/follow-ups`, {
      parrot_id: parrotId,
      ...followUp,
    });
    return { success: true, data };
  }

  /**
   * 获取销售时间线
   */
  static async getSalesTimeline(parrotId: number) {
    const data = await api.get<SalesTimelineEvent[]>(`/parrots/${parrotId}/sales-timeline`);
    return { success: true, data };
  }

  /**
   * 获取销售统计信息
   */
  static async getSalesStatistics(params?: { start_date?: string; end_date?: string }) {
    const data = await api.get<SalesStatistics>('/statistics/sales', params);
    return { success: true, data };
  }

  /**
   * 获取退货统计信息
   */
  static async getReturnStatistics() {
    const data = await api.get<{ return_count: number; return_rate: number }>('/statistics/returns');
    return { success: true, data };
  }

  /**
   * 批量删除销售记录
   */
  static async deleteSalesRecords(ids: number[]) {
    await api.delete('/sales/batch', { data: { ids } });
    return { success: true };
  }
}
