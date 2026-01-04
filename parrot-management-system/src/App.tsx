import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ParrotProvider } from './context/ParrotContext';
import MainLayout from './layouts/MainLayout';
import { routes } from './configs/routes';
import { antdMorandiTheme } from './styles/antdTheme';
import './index.css';

function App() {
  return (
    <ConfigProvider theme={antdMorandiTheme} locale={zhCN}>
      <AntdApp>
        <ParrotProvider>
          <Router>
            <Routes>
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
          </Router>
        </ParrotProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
