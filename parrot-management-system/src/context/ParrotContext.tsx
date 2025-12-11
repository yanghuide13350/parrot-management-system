import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Parrot, FilterParams, Breed, Statistics } from '../types/parrot';
import { ParrotService } from '../services/parrotService';

interface ParrotState {
  parrots: Parrot[];
  breeds: Breed[];
  statistics: Statistics | null;
  loading: boolean;
  error: string | null;
  filters: FilterParams;
  selectedParrot: Parrot | null;
  page: number;
  pageSize: number;
  total: number;
}

type ParrotAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PARROTS'; payload: { items: Parrot[]; total: number } }
  | { type: 'SET_BREEDS'; payload: Breed[] }
  | { type: 'SET_STATISTICS'; payload: Statistics }
  | { type: 'ADD_PARROT'; payload: Parrot }
  | { type: 'UPDATE_PARROT'; payload: Parrot }
  | { type: 'DELETE_PARROT'; payload: number }
  | { type: 'SET_SELECTED_PARROT'; payload: Parrot | null }
  | { type: 'SET_FILTERS'; payload: FilterParams }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'UPDATE_PARROT_STATUS'; payload: { id: number; status: string } };

const initialState: ParrotState = {
  parrots: [],
  breeds: [],
  statistics: null,
  loading: false,
  error: null,
  filters: {},
  selectedParrot: null,
  page: 1,
  pageSize: 20,
  total: 0,
};

const parrotReducer = (state: ParrotState, action: ParrotAction): ParrotState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PARROTS':
      return { ...state, parrots: action.payload.items, total: action.payload.total };
    case 'SET_BREEDS':
      return { ...state, breeds: action.payload };
    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload };
    case 'ADD_PARROT':
      return { ...state, parrots: [action.payload, ...state.parrots], total: state.total + 1 };
    case 'UPDATE_PARROT':
      return {
        ...state,
        parrots: state.parrots.map((p) => (p.id === action.payload.id ? action.payload : p)),
        selectedParrot: state.selectedParrot?.id === action.payload.id ? action.payload : state.selectedParrot,
      };
    case 'DELETE_PARROT':
      return {
        ...state,
        parrots: state.parrots.filter((p) => p.id !== action.payload),
        total: state.total - 1
      };
    case 'SET_SELECTED_PARROT':
      return { ...state, selectedParrot: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, page: 1 };
    case 'UPDATE_PARROT_STATUS':
      return {
        ...state,
        parrots: state.parrots.map((p) =>
          p.id === action.payload.id ? { ...p, status: action.payload.status as any } : p
        ),
        selectedParrot:
          state.selectedParrot?.id === action.payload.id
            ? { ...state.selectedParrot, status: action.payload.status as any }
            : state.selectedParrot,
      };
    default:
      return state;
  }
};

interface ParrotContextType extends ParrotState {
  fetchParrots: () => Promise<void>;
  fetchBreeds: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchParrotById: (id: number) => Promise<void>;
  createParrot: (data: any) => Promise<void>;
  updateParrot: (id: number, data: any) => Promise<void>;
  deleteParrot: (id: number) => Promise<void>;
  updateStatus: (id: number, status: string) => Promise<void>;
  uploadParrotPhotos: (parrotId: number, files: File[]) => Promise<void>;
  setFilters: (filters: FilterParams) => void;
  setSelectedParrot: (parrot: Parrot | null) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearFilters: () => void;
  updateFilters: (filters: Partial<FilterParams>) => void;
}

const ParrotContext = createContext<ParrotContextType | null>(null);

export const ParrotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(parrotReducer, initialState);

  const fetchParrots = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = {
        ...state.filters,
        page: state.page,
        size: state.pageSize,
      };
      const response = await ParrotService.getParrots(params);
      if (response.success && response.data) {
        dispatch({
          type: 'SET_PARROTS',
          payload: { items: response.data.items, total: response.data.total },
        });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || '获取鹦鹉列表失败' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters, state.page, state.pageSize]);

  const fetchBreeds = useCallback(async () => {
    try {
      const response = await ParrotService.getBreeds();
      if (response.success && response.data) {
        dispatch({ type: 'SET_BREEDS', payload: response.data });
      }
    } catch (error: any) {
      console.error('获取品种列表失败:', error);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await ParrotService.getStatistics();
      if (response.success && response.data) {
        dispatch({ type: 'SET_STATISTICS', payload: response.data });
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  const fetchParrotById = async (id: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ParrotService.getParrot(id);
      if (response.success && response.data) {
        dispatch({ type: 'SET_SELECTED_PARROT', payload: response.data });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || '获取鹦鹉详情失败' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createParrot = async (data: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ParrotService.createParrot(data);
      if (response.success && response.data) {
        dispatch({ type: 'ADD_PARROT', payload: response.data.parrot });
        await fetchStatistics();
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.detail || '创建鹦鹉失败' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateParrot = async (id: number, data: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ParrotService.updateParrot(id, data);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_PARROT', payload: response.data.parrot });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.detail || '更新鹦鹉信息失败' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteParrot = async (id: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ParrotService.deleteParrot(id);
      if (response.success) {
        dispatch({ type: 'DELETE_PARROT', payload: id });
        await fetchStatistics();
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.detail || '删除鹦鹉失败' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateStatus = async (id: number, status: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ParrotService.updateStatus(id, status);
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_PARROT', payload: response.data });
        await fetchStatistics();
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.detail || '更新状态失败' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const uploadParrotPhotos = async (parrotId: number, files: File[]) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const uploadPromises = files.map((file) => ParrotService.uploadPhoto(parrotId, file));
      const responses = await Promise.all(uploadPromises);

      if (responses.every((res) => res.success)) {
        await fetchParrotById(parrotId);
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.detail || '上传照片失败' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // const returnParrot = async (id: number, returnReason: string) => {
  //   dispatch({ type: 'SET_LOADING', payload: true });
  //   try {
  //     const response = await ParrotService.returnParrot(id, returnReason);
  //     if (response.success && response.data) {
  //       dispatch({ type: 'UPDATE_PARROT', payload: response.data });
  //       await fetchStatistics();
  //     }
  //   } catch (error: any) {
  //     dispatch({ type: 'SET_ERROR', payload: error.response?.data?.detail || '退货失败' });
  //     throw error;
  //   } finally {
  //     dispatch({ type: 'SET_LOADING', payload: false });
  //   }
  // };

  // const relistParrot = async (id: number) => {
  //   dispatch({ type: 'SET_LOADING', payload: true });
  //   try {
  //     const response = await ParrotService.relistParrot(id);
  //     if (response.success && response.data) {
  //       dispatch({ type: 'UPDATE_PARROT', payload: response.data });
  //       await fetchStatistics();
  //     }
  //   } catch (error: any) {
  //     dispatch({ type: 'SET_ERROR', payload: error.response?.data?.detail || '重新上架失败' });
  //     throw error;
  //   } finally {
  //     dispatch({ type: 'SET_LOADING', payload: false });
  //   }
  // };

  const setFilters = (filters: FilterParams) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const updateFilters = (filters: Partial<FilterParams>) => {
    dispatch({ type: 'SET_FILTERS', payload: { ...state.filters, ...filters } });
  };

  const clearFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: {} });
  };

  const setSelectedParrot = (parrot: Parrot | null) => {
    dispatch({ type: 'SET_SELECTED_PARROT', payload: parrot });
  };

  const setPage = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const setPageSize = (pageSize: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
  };

  const value: ParrotContextType = {
    ...state,
    fetchParrots,
    fetchBreeds,
    fetchStatistics,
    fetchParrotById,
    createParrot,
    updateParrot,
    deleteParrot,
    updateStatus,
    uploadParrotPhotos,
    setFilters,
    updateFilters,
    clearFilters,
    setSelectedParrot,
    setPage,
    setPageSize,
  };

  return <ParrotContext.Provider value={value}>{children}</ParrotContext.Provider>;
};

export const useParrot = () => {
  const context = useContext(ParrotContext);
  if (!context) {
    throw new Error('useParrot must be used within a ParrotProvider');
  }
  return context;
};
