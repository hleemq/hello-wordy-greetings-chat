
import React, { useEffect, useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useGoals } from '@/hooks/useGoals';
import { useProfile } from '@/hooks/useProfile';
import { BalanceCard } from './BalanceCard';
import { MonthlySpendingCard } from './MonthlySpendingCard';
import { GoalsProgressCard } from './GoalsProgressCard';
import { QuickAddExpenseSection } from './QuickAddExpenseSection';

const Dashboard = () => {
  const { expenses, loading: expensesLoading } = useExpenses();
  const { goals, loading: goalsLoading } = useGoals();
  const { getDisplayNames } = useProfile();
  const [displayNames, setDisplayNames] = useState(() => getDisplayNames());

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      setDisplayNames(getDisplayNames());
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [getDisplayNames]);

  // Update display names when profile changes
  useEffect(() => {
    setDisplayNames(getDisplayNames());
  }, [getDisplayNames]);

  // Get recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Get top goals
  const priorityGoals = [...goals]
    .sort((a, b) => {
      // Sort by priority first
      const priorityOrder = {
        "Important-Urgent": 0,
        "Important-NotUrgent": 1,
        "NotImportant-Urgent": 2,
        "NotImportant-NotUrgent": 3
      };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      // Then by progress percentage (lowest first)
      const aProgress = (a.saved_amount / a.target_amount) * 100;
      const bProgress = (b.saved_amount / b.target_amount) * 100;
      return aProgress - bProgress;
    })
    .slice(0, 3);
    
  // Calculate this month's spending
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthExpenses = expenses.filter(
    expense => new Date(expense.date) >= firstDayOfMonth
  );
  
  const totalSpentThisMonth = thisMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount, 
    0
  );

  // Calculate who paid what
  const hasnaaPaid = expenses.filter(expense => expense.paid_by === 'Hasnaa')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const achrafPaid = expenses.filter(expense => expense.paid_by === 'Achraf')
    .reduce((sum, expense) => sum + expense.amount, 0);

  if (expensesLoading || goalsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard 
          hasnaaPaid={hasnaaPaid}
          achrafPaid={achrafPaid}
          displayNames={displayNames}
        />

        <MonthlySpendingCard 
          totalSpentThisMonth={totalSpentThisMonth}
          recentExpenses={recentExpenses}
          displayNames={displayNames}
        />

        <GoalsProgressCard priorityGoals={priorityGoals} />
      </div>

      <QuickAddExpenseSection />
    </div>
  );
};

export default Dashboard;
