
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import AddExpenseForm from '@/components/expenses/AddExpenseForm';

export const QuickAddExpenseSection = () => {
  const { t } = useLanguage();

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">{t('quickAddExpense')}</h2>
      <AddExpenseForm />
    </div>
  );
};
