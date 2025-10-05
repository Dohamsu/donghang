import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { LocalDatabase } from './services';
import { Navigation } from './components/ui';
import { AlertProvider } from './contexts/AlertContext';
import Dashboard from './pages/Dashboard';
import CreatePlan from './pages/CreatePlan';
import PlanDetail from './pages/PlanDetail';

function App() {
  useEffect(() => {
    // IndexedDB 초기화
    const initDatabase = async () => {
      try {
        const db = LocalDatabase.getInstance();
        await db.init();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDatabase();
  }, []);

  const navigationItems = [
    { id: 'dashboard', label: '홈', path: '/', icon: 'mdi:home' },
    { id: 'plans', label: '내 계획', path: '/plans', icon: 'mdi:clipboard-text-outline' },
  ];

  return (
    <AlertProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation items={navigationItems} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plans" element={<Navigate to="/" replace />} />
            <Route path="/create-plan" element={<CreatePlan />} />
            <Route path="/plan/:id" element={<PlanDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AlertProvider>
  );
}

export default App;
