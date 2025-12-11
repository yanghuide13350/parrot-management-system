import { api } from './api';
import type { Parrot, ParrotFormData, FilterParams, PaginatedData, Statistics, Photo } from '../types/parrot';

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
}
