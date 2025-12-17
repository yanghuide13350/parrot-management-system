import { theme } from 'antd';
import { morandiTheme } from './theme';

export const antdMorandiTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: morandiTheme.colors.primary,
    colorBgBase: morandiTheme.colors.background,
    colorBgContainer: morandiTheme.colors.surface,
    colorBgElevated: morandiTheme.colors.surface,
    colorTextBase: morandiTheme.colors.ash,
    colorTextSecondary: morandiTheme.colors.stone,
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
      colorItemBg: 'transparent',
      colorItemText: '#ffffff',
      colorItemTextSelected: morandiTheme.colors.primary,
      colorItemBgSelected: morandiTheme.colors.blush,
      colorSubItemBg: 'rgba(255, 255, 255, 0.05)',
    },
    Input: {
      colorBgContainer: morandiTheme.colors.surface,
      colorBorder: morandiTheme.colors.mist,
      colorText: morandiTheme.colors.ash,
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
      colorText: morandiTheme.colors.ash,
    },
  },
};