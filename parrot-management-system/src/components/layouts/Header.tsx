import React from 'react';
import { Layout, Button, Space, Breadcrumb } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onCollapse: () => void;
  currentPath?: string;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter((i) => i);
    const breadcrumbNameMap: Record<string, string> = {
      dashboard: '仪表板',
      parrots: '鹦鹉管理',
      list: '鹦鹉列表',
      breeding: '繁殖管理',
      'breeding-birds': '种鸟管理',
      incubation: '孵化管理',
      'incubation-list': '孵化列表',
      chicks: '雏鸟管理',
      sales: '销售管理',
      'sales-records': '销售记录',
      returns: '退货管理',
      settings: '系统设置',
      users: '用户管理',
    };

    return [
      {
        title: (
          <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <HomeOutlined /> 首页
          </span>
        ),
      },
      ...pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSnippets.length - 1;
        const name = breadcrumbNameMap[pathSnippets[index]] || pathSnippets[index];

        return {
          title: isLast ? (
            <span>{name}</span>
          ) : (
            <span
              onClick={() => navigate(url)}
              style={{ cursor: 'pointer', color: '#1890ff' }}
            >
              {name}
            </span>
          ),
        };
      }),
    ];
  };

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onCollapse}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
        <span style={{ color: 'var(--morandi-ash)', fontSize: '14px', marginLeft: '16px' }}>
          欢迎使用鹦鹉管理系统
        </span>
      </div>

      <Space align="center">
        <Breadcrumb
          items={getBreadcrumbItems()}
          style={{ marginRight: '24px' }}
        />
      </Space>
    </AntHeader>
  );
};

export default Header;
