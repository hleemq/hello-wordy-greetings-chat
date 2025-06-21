
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from '@/hooks/useExpenses';

interface MonthlySpendingCardProps {
  totalSpentThisMonth: number;
  recentExpenses: Expense[];
  displayNames: {
    hasnaaName: string;
    achrafName: string;
  };
}

export const MonthlySpendingCard = ({ totalSpentThisMonth, recentExpenses, displayNames }: MonthlySpendingCardProps) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('monthlySpending')}</CardTitle>
          <CardDescription>
            {t('overviewFor')} {new Date().toLocaleString('default', { month: 'long' })}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{totalSpentThisMonth.toFixed(2)} MAD</div>
            <div className="text-sm text-gray-500">{t('totalSpentThisMonth')}</div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('recentExpenses')}</h4>
            {recentExpenses.length > 0 ? (
              <div className="space-y-2">
                {recentExpenses.map(expense => (
                  <div key={expense.id} className="flex justify-between items-center text-sm p-2 border-b">
                    <div>
                      <div>{t(expense.category.toLowerCase())}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString()} {t('by')} {
                          expense.paid_by === 'Hasnaa' ? displayNames.hasnaaName : displayNames.achrafName
                        }
                      </div>
                    </div>
                    <div className="font-medium">{expense.amount.toFixed(2)} MAD</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-gray-500 text-sm">
                {t('noExpensesRecorded')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
