import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ParrotOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  ShoppingOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '仪表板',
    icon: <DashboardOutlined />,
    path: '/dashboard',
  },
  {
    key: 'parrots',
    label: '鹦鹉管理',
    icon: <ParrotOutlined />,
    children: [
      {
        key: 'parrot-list',
        label: '鹦鹉列表',
        icon: <ParrotOutlined />,
        path: '/parrots/list',
      },
      {
        key: 'parrot-add',
        label: '添加鹦鹉',
        icon: <ParrotOutlined />,
        path: '/parrots/add',
      },
    ],
  },
  {
    key: 'breeding',
    label: '繁殖管理',
    icon: <HeartOutlined />,
    path: '/breeding/breeding-birds',
  },
  {
    key: 'incubation',
    label: '孵化管理',
    icon: <ThunderboltOutlined />,
    children: [
      {
        key: 'incubation-list',
        label: '孵化列表',
        icon: <ThunderboltOutlined />,
        path: '/incubation/incubation-list',
      },
      {
        key: 'chick-management',
        label: '雏鸟管理',
        icon: <ThunderboltOutlined />,
        path: '/incubation/chicks',
      },
    ],
  },
  {
    key: 'sales',
    label: '销售管理',
    icon: <ShoppingOutlined />,
    children: [
      {
        key: 'sales-records',
        label: '销售记录',
        icon: <ShoppingOutlined />,
        path: '/sales/sales-records',
      },
      {
        key: 'returns',
        label: '退货管理',
        icon: <ShoppingOutlined />,
        path: '/sales/returns',
      },
    ],
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: <SettingOutlined />,
    children: [
      {
        key: 'user-management',
        label: '用户管理',
        icon: <SettingOutlined />,
        path: '/settings/users',
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = findMenuItemByKey(menuItems, key);
    if (item && item.path) {
      navigate(item.path);
    }
  };

  const findMenuItemByKey = (items: MenuItem[], key: string): MenuItem | undefined => {
    for (const item of items) {
      if (item.key === key) {
        return item;
      }
      if (item.children) {
        const found = findMenuItemByKey(item.children, key);
        if (found) return found;
      }
    }
    return undefined;
  };

  const getSelectedKeys = (): string[] => {
    const path = location.pathname;
    if (path === '/dashboard') return ['dashboard'];
    if (path.startsWith('/parrots')) {
      if (path === '/parrots/add') return ['parrot-add'];
      return ['parrot-list'];
    }
    if (path.startsWith('/breeding')) return ['breeding'];
    if (path.startsWith('/incubation')) {
      if (path.includes('/chicks')) return ['chick-management'];
      return ['incubation-list'];
    }
    if (path.startsWith('/sales')) {
      if (path.includes('/returns')) return ['returns'];
      return ['sales-records'];
    }
    if (path.startsWith('/settings')) return ['user-management'];
    return [];
  };

  const getOpenKeys = (): string[] => {
    const path = location.pathname;
    if (path.startsWith('/parrots')) return ['parrots'];
    if (path.startsWith('/incubation')) return ['incubation'];
    if (path.startsWith('/sales')) return ['sales'];
    if (path.startsWith('/settings')) return ['settings'];
    return [];
  };

  const renderMenuItems = (items: MenuItem[]): React.ReactNode => {
    return items.map((item) => {
      if (item.children) {
        return (
          <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item key={item.key} icon={item.icon}>
          {item.label}
        </Menu.Item>
      );
    });
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      style={{
        background: '#001529',
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 'bold',
          background: '#002140',
        }}
      >
        {collapsed ? '🦜' : '鹦鹉管理系统'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      >
        {renderMenuItems(menuItems)}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
