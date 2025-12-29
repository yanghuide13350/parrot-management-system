import { api } from './api';

export interface ShareLink {
  id: number;
  token: string;
  url: string;
  created_at: string;
  expires_at: string;
  remaining_days: number;
}

export interface ShareLinkListResponse {
  total: number;
  items: ShareLink[];
}

export const ShareService = {
  /**
   * 生成分享链接
   */
  generateShareLink: async (parrotId: number): Promise<ShareLink> => {
    return api.post(`/share/generate/${parrotId}`);
  },

  /**
   * 获取鹦鹉的分享链接列表
   */
  getShareLinks: async (parrotId: number): Promise<ShareLinkListResponse> => {
    return api.get(`/share/list/${parrotId}`);
  },

  /**
   * 删除分享链接
   */
  deleteShareLink: async (token: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/share/${token}`);
  },
};
