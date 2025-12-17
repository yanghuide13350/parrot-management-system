import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { Spin, ConfigProvider } from 'antd';
import { ParrotProvider } from './context/ParrotContext';
import MainLayout from './layouts/MainLayout';
import { routes } from './configs/routes';
import { antdMorandiTheme } from './styles/antdTheme';
import './index.css';

// 加载中组件
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <ConfigProvider theme={antdMorandiTheme}>
      <ParrotProvider>
        <Router>
          <MainLayout>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {routes.map((route) => {
                  if (route.children) {
                    return (
                      <Route key={route.path} path={route.path}>
                        {route.children.map((child) => (
                          <Route key={child.path || 'index'} {...child} />
                        ))}
                      </Route>
                    );
                  }
                  return <Route key={route.path} path={route.path} element={route.element} />;
                })}
              </Routes>
            </Suspense>
          </MainLayout>
        </Router>
      </ParrotProvider>
    </ConfigProvider>
  );
}

export default App;
