import React from 'react';
import { Layout, Button, Breadcrumb } from 'antd';
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

    // 根据层级定义颜色
    const getBreadcrumbColor = (level: number, isLast: boolean) => {
      if (isLast) {
        return '#8B8C89'; // 最后一级用 ash 灰色
      }
      switch (level) {
        case 0: return '#6D7A8D'; // 一级用 slate 深色
        case 1: return '#A89994'; // 二级用 stone 中等
        case 2: return '#BEB5A2'; // 三级用 tea 浅色
        default: return '#8B8C89'; // 更多层级用 ash
      }
    };

    return [
      {
        title: (
          <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', color: getBreadcrumbColor(-1, false) }}>
            <HomeOutlined /> 首页
          </span>
        ),
      },
      ...pathSnippets
        .filter((snippet) => snippet !== 'list')
        .map((snippet, index, arr) => {
          const url = `/${pathSnippets.slice(0, pathSnippets.indexOf(snippet) + 1).join('/')}`;
          const isLast = index === arr.length - 1;
          const name = breadcrumbNameMap[snippet] || snippet;

          return {
            title: isLast ? (
              <span style={{ color: getBreadcrumbColor(index, true) }}>{name}</span>
            ) : (
              <span
                onClick={() => navigate(url)}
                style={{ cursor: 'pointer', color: getBreadcrumbColor(index, false) }}
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
        <Breadcrumb
          items={getBreadcrumbItems()}
          style={{ marginLeft: '16px' }}
        />
      </div>
    </AntHeader>
  );
};

export default Header;
