
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Navigation from './Navigation';
import Dashboard from '../dashboard/Dashboard';
import ExpensesPage from '../expenses/ExpensesPage';
import GoalsPage from '../goals/GoalsPage';
import ReportsPage from '../reports/ReportsPage';
import LoginScreen from '../auth/LoginScreen';

const Layout = () => {
  const { state } = useFinance();
  const { isLoggedIn, currentView } = state;

  if (!isLoggedIn) {
    return (
      <LanguageProvider>
        <LoginScreen />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50" dir={window.document.documentElement.dir}>
        <Navigation />
        <main>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'expenses' && <ExpensesPage />}
          {currentView === 'goals' && <GoalsPage />}
          {currentView === 'reports' && <ReportsPage />}
        </main>
      </div>
    </LanguageProvider>
  );
};

export default Layout;
