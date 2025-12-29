import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Spin, ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ParrotProvider } from './context/ParrotContext';
import MainLayout from './layouts/MainLayout';
import { routes } from './configs/routes';
import { antdMorandiTheme } from './styles/antdTheme';
import './index.css';

// 懒加载分享页面（公开访问，不需要主布局）
const SharePage = lazy(() => import('./pages/SharePage'));

// 加载中组件
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <ConfigProvider theme={antdMorandiTheme} locale={zhCN}>
      <AntdApp>
        <ParrotProvider>
          <Router>
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* 分享页面 - 公开访问，不使用主布局 */}
                <Route path="/share/:token" element={<SharePage />} />
                
                {/* 管理页面 - 使用主布局 */}
                <Route path="/*" element={
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      {routes.map((route) => {
                        if (route.children) {
                          return (
                            <Route key={route.path} path={route.path}>
                              {route.children.map((child) => (
                                <Route
                                  key={child.path || 'index'}
                                  path={child.path}
                                  element={child.element}
                                  index={child.index}
                                />
                              ))}
                            </Route>
                          );
                        }
                        return <Route key={route.path} path={route.path} element={route.element} />;
                      })}
                    </Routes>
                  </MainLayout>
                } />
              </Routes>
            </Suspense>
          </Router>
        </ParrotProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
