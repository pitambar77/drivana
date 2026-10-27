import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, MemoryRouter, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { StoreProvider } from './store/AppStore';
import { ToastProvider } from './components/ui/Toast';
import DemoNavigator from './components/layout/DemoNavigator';
import './styles/index.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// The single-file preview runs inside a sandboxed frame, so it routes in memory.
// The regular build uses real URLs (configure your host to fall back to index.html).
// eslint-disable-next-line no-undef
const Router = __SINGLE_FILE__ ? MemoryRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <AppRoutes />
          <DemoNavigator />
        </Router>
      </ToastProvider>
    </StoreProvider>
  </React.StrictMode>,
);
