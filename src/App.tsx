import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { LocalDatabase, LocalStorageService } from './services';
import { Navigation } from './components/ui';
import { AlertProvider } from './contexts/AlertContext';
import Dashboard from './pages/Dashboard';
import CreatePlan from './pages/CreatePlan';
import PlanDetail from './pages/PlanDetail';
import { v4 as uuidv4 } from 'uuid';

function App() {
  useEffect(() => {
    // Database 및 사용자 초기화
    const initDatabase = async () => {
      try {
        const db = LocalDatabase.getInstance();
        await db.init();
        console.log('Database initialized successfully');

        // 현재 사용자 ID 가져오기 또는 생성
        let userId = LocalStorageService.getItem<string>('currentUserId');
        if (!userId) {
          userId = uuidv4();
          LocalStorageService.setItem('currentUserId', userId);
          console.log('Created new user ID:', userId);
        }

        // users 테이블에 사용자가 없으면 생성
        try {
          const existingUser = await db.read('users', userId);
          if (!existingUser) {
            await db.create('users', {
              id: userId,
              name: 'Anonymous User',
              email: null,
              avatar: null,
            });
            console.log('User created in database:', userId);
          }
        } catch (error) {
          console.log('User creation skipped or already exists');
        }
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
