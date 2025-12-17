import { morandiTheme } from '../styles/theme';

/**
 * Get Morandi color for parrot status
 */
export const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    available: morandiTheme.status.available,
    sold: morandiTheme.status.sold,
    breeding: morandiTheme.status.breeding,
    returned: morandiTheme.status.returned,
    incubating: morandiTheme.status.incubating,
  };

  return statusMap[status] || morandiTheme.colors.stone;
};

/**
 * Get Morandi background color for parrot status (lighter version)
 */
export const getStatusBackgroundColor = (status: string) => {
  const bgStatusMap: Record<string, string> = {
    available: 'rgba(156, 175, 136, 0.1)',
    sold: 'rgba(200, 166, 162, 0.1)',
    breeding: 'rgba(168, 153, 148, 0.1)',
    returned: 'rgba(190, 181, 162, 0.1)',
    incubating: 'rgba(109, 122, 141, 0.1)',
  };

  return bgStatusMap[status] || 'rgba(168, 153, 148, 0.1)';
};

/**
 * Get status tag className for Morandi styling
 */
export const getStatusClassName = (status: string) => {
  const classNameMap: Record<string, string> = {
    available: 'status-available',
    sold: 'status-sold',
    breeding: 'status-breeding',
    returned: 'status-returned',
    incubating: 'status-incubating',
  };

  return classNameMap[status] || 'status-breeding';
};

/**
 * Get status text in Chinese
 */
export const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    available: '在售',
    sold: '已售',
    breeding: '种鸟',
    returned: '已退回',
    incubating: '孵化中',
  };

  return textMap[status] || status;
};

/**
 * Get gender color
 */
export const getGenderColor = (gender: string) => {
  return gender === '公' ? '#9CAF88' : gender === '母' ? '#C8A6A2' : '#6D7A8D';
};

/**
 * Get gender background color (lighter version)
 */
export const getGenderBackgroundColor = (gender: string) => {
  return gender === '公' ? 'rgba(156, 175, 136, 0.1)' :
         gender === '母' ? 'rgba(200, 166, 162, 0.1)' :
         'rgba(109, 122, 141, 0.1)';
};