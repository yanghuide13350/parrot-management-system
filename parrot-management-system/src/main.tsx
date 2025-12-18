import '@ant-design/v5-patch-for-react-19';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 在生产环境或为了避免开发环境下的双重请求，可以移除 StrictMode
// StrictMode 只在开发环境导致双重渲染，生产环境不会
ReactDOM.createRoot(document.getElementById('app')!).render(
  <App />
);
