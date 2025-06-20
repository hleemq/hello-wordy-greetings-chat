
import React from 'react';
import Navigation from './Navigation';
import Dashboard from '@/components/dashboard/Dashboard';
import ExpensesPage from '@/components/expenses/ExpensesPage';
import GoalsPage from '@/components/goals/GoalsPage';
import ReportsPage from '@/components/reports/ReportsPage';
import ConsultantPage from '@/components/consultant/ConsultantPage';
import { useFinance } from '@/context/FinanceContext';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import NetworkStatus from './NetworkStatus';
import Settings from '@/pages/Settings';

const Layout = () => {
  const { state } = useFinance();

  // Render the appropriate page based on currentView
  const renderPage = () => {
    switch (state.currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpensesPage />;
      case 'goals':
        return <GoalsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'consultant':
        return <ConsultantPage />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16 pb-4 md:pb-8 overflow-hidden">
        <div className="h-full">
          {renderPage()}
        </div>
      </main>
      <InstallPrompt />
      <NetworkStatus />
    </div>
  );
};

export default Layout;
