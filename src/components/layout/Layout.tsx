
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/hooks/use-theme';
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
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <LoginScreen />
        </LanguageProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light">
      <LanguageProvider>
        <div className="min-h-screen bg-cloud dark:bg-[#121212]" dir={window.document.documentElement.dir}>
          <Navigation />
          <main>
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'expenses' && <ExpensesPage />}
            {currentView === 'goals' && <GoalsPage />}
            {currentView === 'reports' && <ReportsPage />}
          </main>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default Layout;
