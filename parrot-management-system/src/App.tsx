import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { ParrotProvider } from './context/ParrotContext';
import ParrotListPage from './pages/ParrotListPage';
import Dashboard from './pages/Dashboard';
import BreedingManagementPage from './pages/BreedingManagementPage';
import './index.css';

const { Content } = Layout;

function App() {
  return (
    <ParrotProvider>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Layout>
            <Content style={{ padding: '24px', background: '#f0f2f5' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/parrots" element={<ParrotListPage />} />
                <Route path="/breeding" element={<BreedingManagementPage />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ParrotProvider>
  );
}

export default App;
