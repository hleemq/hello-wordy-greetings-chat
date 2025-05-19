
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
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
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'expenses' && <ExpensesPage />}
        {currentView === 'goals' && <GoalsPage />}
        {currentView === 'reports' && <ReportsPage />}
      </main>
    </div>
  );
};

export default Layout;
