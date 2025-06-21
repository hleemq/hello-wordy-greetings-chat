import React, { useEffect, useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useGoals } from '@/hooks/useGoals';
import { useProfile } from '@/hooks/useProfile';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';
import AddExpenseForm from '@/components/expenses/AddExpenseForm';
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { expenses, loading: expensesLoading } = useExpenses();
  const { goals, loading: goalsLoading } = useGoals();
  const { getDisplayNames } = useProfile();
  const { t } = useLanguage();
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
  
  const difference = Math.abs(hasnaaPaid - achrafPaid);
  const whoOwes = hasnaaPaid > achrafPaid ? 'Achraf' : hasnaaPaid < achrafPaid ? 'Hasnaa' : null;

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
        {/* Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('balanceSummary')}</CardTitle>
              <CardDescription>{t('currentBalance')}</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80">
                  <p>{t('balanceTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-4 text-center">
                  <div className="text-sm text-gray-500">{displayNames.hasnaaName} Paid</div>
                  <div className="text-xl font-semibold">{hasnaaPaid.toFixed(2)} MAD</div>
                </div>
                <div className="border rounded p-4 text-center">
                  <div className="text-sm text-gray-500">{displayNames.achrafName} Paid</div>
                  <div className="text-xl font-semibold">{achrafPaid.toFixed(2)} MAD</div>
                </div>
              </div>

              <div className="border-t pt-4">
                {whoOwes ? (
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <span className="font-medium">
                      {whoOwes === 'Hasnaa' ? displayNames.hasnaaName : displayNames.achrafName}
                    </span> {t('owes')}{' '}
                    <span className="font-medium">
                      {whoOwes === 'Hasnaa' ? displayNames.achrafName : displayNames.hasnaaName}
                    </span>{' '}
                    <span className="text-lg font-semibold">{difference.toFixed(2)} MAD</span>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <span className="text-gray-600">{t('balancedExpenses')}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spending Card */}
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

        {/* Goals Progress Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('goalProgress')}</CardTitle>
              <CardDescription>{t('trackSavingsGoals')}</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80">
                  <p>{t('goalProgressTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            {priorityGoals.length > 0 ? (
              <div className="space-y-4">
                {priorityGoals.map(goal => {
                  const progress = Math.round((goal.saved_amount / goal.target_amount) * 100);
                  const monthsLeft = Math.max(
                    1,
                    Math.ceil(
                      (new Date(goal.deadline).getTime() - new Date().getTime()) / 
                      (30 * 24 * 60 * 60 * 1000)
                    )
                  );
                  const monthlySavingsNeeded = monthsLeft > 0 
                    ? (goal.target_amount - goal.saved_amount) / monthsLeft 
                    : 0;

                  const priorityLabels = {
                    "Important-Urgent": t('importantUrgent'),
                    "Important-NotUrgent": t('importantNotUrgent'),
                    "NotImportant-Urgent": t('urgentNotImportant'),
                    "NotImportant-NotUrgent": t('notImportantOrUrgent')
                  };
                  
                  const priorityColors = {
                    "Important-Urgent": "bg-red-100 text-red-800",
                    "Important-NotUrgent": "bg-blue-100 text-blue-800",
                    "NotImportant-Urgent": "bg-yellow-100 text-yellow-800",
                    "NotImportant-NotUrgent": "bg-gray-100 text-gray-800"
                  };

                  return (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{goal.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[goal.priority]}`}>
                              {priorityLabels[goal.priority]}
                            </span>
                            <span className="text-xs text-gray-500">
                              {t('due')} {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 text-right">
                          <div className="text-sm font-medium">{goal.saved_amount} / {goal.target_amount} MAD</div>
                          <div className="text-xs text-gray-500">
                            {t('save')} {monthlySavingsNeeded.toFixed(2)} MAD/{t('month')}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{progress}% {t('complete')}</span>
                          <span className="text-xs text-gray-500">{monthsLeft} {t('monthsLeft')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">{t('noSavingsGoals')}</p>
                <Button variant="outline" size="sm" onClick={() => 
                  document.getElementById('add-goal-button')?.click()
                }>
                  {t('addGoal')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Expense */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">{t('quickAddExpense')}</h2>
        <AddExpenseForm />
      </div>
    </div>
  );
};

export default Dashboard;
