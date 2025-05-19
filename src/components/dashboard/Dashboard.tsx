
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';
import AddExpenseForm from '@/components/expenses/AddExpenseForm';
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { state } = useFinance();
  const { expenses, goals, balance } = state;

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
      const aProgress = (a.savedAmount / a.targetAmount) * 100;
      const bProgress = (b.savedAmount / b.targetAmount) * 100;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Balance Summary</CardTitle>
              <CardDescription>Current balance between profiles</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80">
                  <p>This shows the current balance between both profiles. If there's a difference, it shows who owes money to balance expenses.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-4 text-center">
                  <div className="text-sm text-gray-500">Hasnaa paid</div>
                  <div className="text-xl font-semibold">${balance.hasnaaPaid.toFixed(2)}</div>
                </div>
                <div className="border rounded p-4 text-center">
                  <div className="text-sm text-gray-500">Achraf paid</div>
                  <div className="text-xl font-semibold">${balance.achrafPaid.toFixed(2)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                {balance.whoOwes ? (
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <span className="font-medium">{balance.whoOwes}</span> owes{' '}
                    <span className="font-medium">{balance.whoOwes === 'Hasnaa' ? 'Achraf' : 'Hasnaa'}</span>{' '}
                    <span className="text-lg font-semibold">${balance.amount.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-gray-50 rounded-md">
                    <span className="text-gray-600">All expenses are perfectly balanced</span>
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
              <CardTitle>Monthly Spending</CardTitle>
              <CardDescription>Overview for {new Date().toLocaleString('default', { month: 'long' })}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold">${totalSpentThisMonth.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Total spent this month</div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent expenses</h4>
                {recentExpenses.length > 0 ? (
                  <div className="space-y-2">
                    {recentExpenses.map(expense => (
                      <div key={expense.id} className="flex justify-between items-center text-sm p-2 border-b">
                        <div>
                          <div>{expense.category}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(expense.date).toLocaleDateString()} by {expense.paidBy}
                          </div>
                        </div>
                        <div className="font-medium">${expense.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-500 text-sm">
                    No expenses recorded yet
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
              <CardTitle>Goal Progress</CardTitle>
              <CardDescription>Track your savings goals</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80">
                  <p>Track progress toward your shared goals. Goals are sorted by priority and progress.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            {priorityGoals.length > 0 ? (
              <div className="space-y-4">
                {priorityGoals.map(goal => {
                  const progress = Math.round((goal.savedAmount / goal.targetAmount) * 100);
                  const monthsLeft = Math.max(
                    1,
                    Math.ceil(
                      (new Date(goal.deadline).getTime() - new Date().getTime()) / 
                      (30 * 24 * 60 * 60 * 1000)
                    )
                  );
                  const monthlySavingsNeeded = monthsLeft > 0 
                    ? (goal.targetAmount - goal.savedAmount) / monthsLeft 
                    : 0;

                  const priorityLabels = {
                    "Important-Urgent": "Important & Urgent",
                    "Important-NotUrgent": "Important, Not Urgent",
                    "NotImportant-Urgent": "Urgent, Not Important",
                    "NotImportant-NotUrgent": "Not Important or Urgent"
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
                              Due {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 text-right">
                          <div className="text-sm font-medium">${goal.savedAmount} / ${goal.targetAmount}</div>
                          <div className="text-xs text-gray-500">
                            Save ${monthlySavingsNeeded.toFixed(2)}/month
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{progress}% complete</span>
                          <span className="text-xs text-gray-500">{monthsLeft} months left</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No savings goals added yet</p>
                <Button variant="outline" size="sm" onClick={() => 
                  document.getElementById('add-goal-button')?.click()
                }>
                  Add a Goal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Expense */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Add Expense</h2>
        <AddExpenseForm />
      </div>
    </div>
  );
};

export default Dashboard;
