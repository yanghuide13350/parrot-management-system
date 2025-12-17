import React, { useState } from 'react';
import { Layout } from 'antd';
import { useLocation } from 'react-router-dom';
import Header from '../components/layouts/Header';
import Sidebar from '../components/layouts/Sidebar';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout style={{
        marginLeft: collapsed ? 80 : 240,
        transition: 'margin-left 0.2s ease'
      }}>
        <Header
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          currentPath={location.pathname}
        />
        <Content
          style={{
            minHeight: 280,
            background: 'var(--morandi-cloud)',
            borderRadius: '8px',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
