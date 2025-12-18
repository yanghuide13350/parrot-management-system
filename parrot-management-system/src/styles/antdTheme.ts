import { theme } from 'antd';
import { morandiTheme } from './theme';

export const antdMorandiTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: morandiTheme.colors.primary,
    colorBgBase: morandiTheme.colors.background,
    colorBgContainer: morandiTheme.colors.surface,
    colorBgElevated: morandiTheme.colors.surface,
    colorTextBase: '#2C2A28', // Darker text for better contrast
    colorTextSecondary: '#6D7A8D', // Medium contrast text
    colorBorder: morandiTheme.colors.mist,
    colorBorderSecondary: morandiTheme.colors.mist,
    colorSuccess: morandiTheme.colors.primary,
    colorWarning: morandiTheme.colors.tea,
    colorError: morandiTheme.colors.dustyRose,
    colorInfo: morandiTheme.colors.slate,
    borderRadius: 8,
    wireframe: false,
  },
  components: {
    Button: {
      colorPrimary: morandiTheme.colors.primary,
      colorPrimaryHover: morandiTheme.colors.blush,
      colorPrimaryActive: morandiTheme.colors.stone,
      defaultBg: morandiTheme.colors.surface,
      defaultBorderColor: morandiTheme.colors.mist,
      defaultColor: morandiTheme.colors.ash,
    },
    Card: {
      colorBgContainer: morandiTheme.colors.surface,
      colorBorderSecondary: morandiTheme.colors.mist,
    },
    Table: {
      colorBgContainer: morandiTheme.colors.surface,
      headerBg: morandiTheme.colors.cloud,
      headerColor: morandiTheme.colors.ash,
      borderColor: morandiTheme.colors.mist,
    },
    Menu: {
      colorBgContainer: morandiTheme.colors.slate,
      itemBg: 'transparent',
      itemColor: '#ffffff',
      itemSelectedColor: morandiTheme.colors.primary,
      itemSelectedBg: morandiTheme.colors.blush,
      subMenuItemBg: 'rgba(255, 255, 255, 0.05)',
    },
    Input: {
      colorBgContainer: morandiTheme.colors.surface,
      colorBorder: morandiTheme.colors.mist,
      colorText: '#2C2A28',
    },
    Select: {
      colorBgContainer: morandiTheme.colors.surface,
      colorBorder: morandiTheme.colors.mist,
      optionSelectedBg: morandiTheme.colors.cloud,
    },
    Modal: {
      contentBg: morandiTheme.colors.surface,
      headerBg: morandiTheme.colors.surface,
    },
    Tag: {
      colorBgContainer: morandiTheme.colors.cloud,
      colorBorder: morandiTheme.colors.mist,
      colorText: '#2C2A28',
    },
  },
};