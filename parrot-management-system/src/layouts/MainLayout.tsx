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

  const sidebarWidth = collapsed ? 80 : 240;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout style={{
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.2s ease'
      }}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: sidebarWidth,
          right: 0,
          zIndex: 100,
          transition: 'left 0.2s ease',
        }}>
          <Header
            collapsed={collapsed}
            onCollapse={() => setCollapsed(!collapsed)}
            currentPath={location.pathname}
          />
        </div>
        <Content
          style={{
            minHeight: 280,
            marginTop: 64,
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
