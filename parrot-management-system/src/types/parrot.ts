// 鹦鹉状态
export type ParrotStatus = 'available' | 'sold' | 'returned' | 'breeding' | 'paired' | 'incubating';

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

// 月度销售数据
export interface MonthlySalesData {
  month: string;      // 格式: YYYY-MM
  month_name: string; // 格式: 1月
  count: number;      // 销售数量
  revenue: number;    // 销售额
}

// 月度销售统计响应
export interface MonthlySales {
  monthly_sales: MonthlySalesData[];
}

// 销售记录状态
export type SaleStatus = 'completed' | 'returned' | 'pending' | 'cancelled';

// 支付方式
export type PaymentMethod = 'cash' | 'transfer' | 'wechat' | 'alipay' | 'other';

// 回访状态
export type FollowUpStatus = 'pending' | 'completed' | 'no_contact';

// 销售记录
export interface SaleRecord {
  id: number;
  parrot_id: number;
  seller: string; // 售卖人
  buyer_name: string; // 购买者姓名
  sale_price: number; // 销售价格
  contact: string; // 联系方式
  follow_up_status: FollowUpStatus; // 回访状态
  sale_notes?: string; // 销售备注
  sale_date: string; // 销售时间
  payment_method?: PaymentMethod; // 支付方式
  created_at: string;
  updated_at: string;
  // 关联的鹦鹉信息
  parrot?: {
    breed: string;
    ring_number?: string;
    gender: ParrotGender;
  };
}

// 销售历史记录（包含退货信息）
export interface SalesHistoryRecord {
  id: number;
  parrot_id: number;
  seller: string;
  buyer_name: string;
  sale_price: number;
  contact: string;
  follow_up_status: FollowUpStatus;
  sale_notes?: string;
  sale_date: string;
  payment_method?: PaymentMethod;
  return_date?: string; // 退货时间
  return_reason?: string; // 退货原因
  created_at: string;
  updated_at: string;
  // 关联的鹦鹉信息
  parrot?: {
    breed: string;
    ring_number?: string;
    gender: ParrotGender;
  };
}

// 回访记录
export interface FollowUpRecord {
  id: number;
  parrot_id: number;
  follow_up_date: string; // 回访日期
  follow_up_status: FollowUpStatus;
  notes: string; // 回访备注
  created_at: string;
  updated_at: string;
  // 关联的鹦鹉信息
  parrot?: {
    breed: string;
    ring_number?: string;
    buyer_name?: string;
  };
}

// 销售筛选条件
export interface SalesFilterParams {
  keyword?: string; // 搜索关键词（客户名称或圈号）
  breed?: string; // 品种筛选
  seller?: string; // 售卖人筛选
  payment_method?: PaymentMethod; // 支付方式筛选
  follow_up_status?: FollowUpStatus; // 回访状态筛选
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
  has_return?: boolean; // 是否仅显示有退货记录的
  page?: number;
  pageSize?: number;
}

// 销售统计数据
export interface SalesStatistics {
  total_sales: number; // 总销售数量
  total_revenue: number; // 总销售额
  average_price: number; // 平均销售价格
  returned_count: number; // 退货数量
  return_rate: number; // 退货率
  pending_follow_up: number; // 待回访数量
  payment_method_stats: Record<PaymentMethod, number>; // 支付方式统计
  monthly_sales: MonthlySalesData[]; // 月度销售数据
  top_sellers: Array<{
    seller: string;
    count: number;
    revenue: number;
  }>; // 销售排行
  top_buyers: Array<{
    buyer_name: string;
    count: number;
    total_spent: number;
  }>; // 客户排行
}

// 销售时间线事件
export interface SalesTimelineEvent {
  id: string;
  type: 'created' | 'sold' | 'follow_up' | 'returned' | 'relisted';
  title: string;
  description: string;
  date: string;
  icon?: string;
  status?: string;
}
