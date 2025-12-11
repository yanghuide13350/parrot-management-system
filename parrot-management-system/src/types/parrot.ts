// 鹦鹉状态
export type ParrotStatus = 'available' | 'sold' | 'returned' | 'breeding';

// 鹦鹉性别
export type ParrotGender = '公' | '母' | '未验卡';

// 鹦鹉基础信息
export interface Parrot {
  id: number;
  breed: string;
  price?: number | null; // 价格（单一价格）
  min_price?: number | null; // 最低价格（价格区间）
  max_price?: number | null; // 最高价格（价格区间）
  gender: ParrotGender;
  birth_date: string | null;
  ring_number: string | null;
  health_notes: string | null;
  status: ParrotStatus;
  created_at: string;
  updated_at: string;
  photo_count: number;
  sold_at?: string | null; // 销售时间
  returned_at?: string | null; // 退货时间
  return_reason?: string | null; // 退货原因
  mate_id?: number | null; // 配偶ID
  paired_at?: string | null; // 配对时间
}

// 照片信息
export interface Photo {
  id: number;
  file_path: string;
  file_name: string;
  file_type: 'image' | 'video';
  sort_order: number;
}

// 鹦鹉创建/更新数据
export interface ParrotFormData {
  breed: string;
  price?: number | null;
  gender: ParrotGender;
  birth_date?: string | null;
  ring_number?: string | null;
  health_notes?: string | null;
}

// 筛选条件
export interface FilterParams {
  breed?: string;
  status?: ParrotStatus;
  gender?: ParrotGender;
  keyword?: string;
  min_age_days?: number;
  max_age_days?: number;
  min_price?: number;
  max_price?: number;
  page?: number;
  pageSize?: number;
}

// 品种（前端用于显示，实际后端使用字符串）
export interface Breed {
  name: string;
  count: number;
}

// API响应
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 分页数据
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// 统计信息
export interface Statistics {
  total_parrots: number;
  available_parrots: number;
  sold_parrots: number;
  returned_parrots: number;
  breed_counts: Record<string, number>;
  total_revenue: number;
}
