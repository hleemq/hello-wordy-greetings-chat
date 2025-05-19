
import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Trash2 } from 'lucide-react';
import { Expense, ExpenseCategory } from '@/types/finance';
import AddExpenseForm from './AddExpenseForm';

const ExpensesPage = () => {
  const { state, dispatch } = useFinance();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  const categories: ExpenseCategory[] = [
    "Rent", "Utilities", "Groceries", "Dining", "Transportation", 
    "Entertainment", "Health", "Shopping", "Other"
  ];

  // Get all available years from expenses
  const years = Array.from(
    new Set(
      state.expenses.map(expense => new Date(expense.date).getFullYear())
    )
  ).sort((a, b) => b - a);
  
  // If no expenses yet, use current year
  if (years.length === 0) {
    years.push(new Date().getFullYear());
  }
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Filter expenses based on criteria
  const filteredExpenses = state.expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const monthMatch = expenseDate.getMonth() === filterMonth;
    const yearMatch = expenseDate.getFullYear() === filterYear;
    const categoryMatch = filterCategory === 'all' || expense.category === filterCategory;
    
    return monthMatch && yearMatch && categoryMatch;
  });
  
  // Sort expenses by date (most recent first)
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Calculate totals by category
  const categoryTotals = categories.map(category => {
    const total = filteredExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
      
    return { category, total };
  }).sort((a, b) => b.total - a.total);

  // Calculate who paid what in the filtered view
  const hasnaaTotal = filteredExpenses
    .filter(expense => expense.paidBy === 'Hasnaa')
    .reduce((sum, expense) => sum + expense.amount, 0);
    
  const achrafTotal = filteredExpenses
    .filter(expense => expense.paidBy === 'Achraf')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={filterYear.toString()} onValueChange={(value) => setFilterYear(parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterMonth.toString()} onValueChange={(value) => setFilterMonth(parseInt(value))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>
              {months[filterMonth]} {filterYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="border rounded-lg p-4 flex-1 text-center">
                  <div className="text-sm text-gray-500">Total Expenses</div>
                  <div className="text-2xl font-bold">
                    ${filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                  </div>
                </div>
                <div className="border rounded-lg p-4 flex-1">
                  <div className="text-sm text-gray-500 text-center">Who Paid</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Hasnaa</div>
                      <div className="font-semibold">${hasnaaTotal.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Achraf</div>
                      <div className="font-semibold">${achrafTotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Top Categories</h4>
                <div className="space-y-2">
                  {categoryTotals.filter(cat => cat.total > 0).slice(0, 4).map((cat) => (
                    <div key={cat.category} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="text-sm">{cat.category}</div>
                      </div>
                      <div className="text-sm font-medium">${cat.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add New Expense</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a new expense to track your spending</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <AddExpenseForm />
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>
            {filterCategory === 'all' ? 'All categories' : filterCategory} |{' '}
            {months[filterMonth]} {filterYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {expense.notes || '-'}
                      </TableCell>
                      <TableCell>{expense.paidBy}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${expense.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteExpense(expense.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete this expense</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No expenses found for the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesPage;
