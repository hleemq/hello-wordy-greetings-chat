
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
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navigation />
      <main className="flex-1 w-full overflow-x-hidden">
        <div className="w-full max-w-full">
          {renderPage()}
        </div>
      </main>
      <InstallPrompt />
      <NetworkStatus />
    </div>
  );
};

export default Layout;
