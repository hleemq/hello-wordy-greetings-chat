
import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ExpenseCategory } from '@/types/finance';

const ReportsPage = () => {
  const { state } = useFinance();
  const { expenses } = state;
  
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [activeTab, setActiveTab] = useState('monthly');
  
  // Get all available years from expenses
  const years = Array.from(
    new Set(
      expenses.map(expense => new Date(expense.date).getFullYear().toString())
    )
  ).sort((a, b) => parseInt(b) - parseInt(a));
  
  // If no expenses yet, use current year
  if (years.length === 0) {
    years.push(new Date().getFullYear().toString());
  }
  
  // Filter expenses by selected year
  const filteredExpenses = expenses.filter(expense => 
    new Date(expense.date).getFullYear().toString() === year
  );
  
  // --------------- MONTHLY BREAKDOWN ---------------
  // Prepare data for monthly spending chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthlyData = monthNames.map((month, index) => {
    const monthExpenses = filteredExpenses.filter(
      expense => new Date(expense.date).getMonth() === index
    );
    
    const hasnaaAmount = monthExpenses
      .filter(expense => expense.paidBy === 'Hasnaa')
      .reduce((sum, expense) => sum + expense.amount, 0);
      
    const achrafAmount = monthExpenses
      .filter(expense => expense.paidBy === 'Achraf')
      .reduce((sum, expense) => sum + expense.amount, 0);
      
    const totalAmount = hasnaaAmount + achrafAmount;
    
    return {
      name: month,
      Hasnaa: hasnaaAmount,
      Achraf: achrafAmount,
      Total: totalAmount
    };
  });
  
  // --------------- CATEGORY BREAKDOWN ---------------
  // Prepare data for category chart
  const categories: ExpenseCategory[] = [
    "Rent", "Utilities", "Groceries", "Dining", "Transportation", 
    "Entertainment", "Health", "Shopping", "Other"
  ];
  
  const categoryData = categories.map(category => {
    const categoryExpenses = filteredExpenses.filter(expense => expense.category === category);
    const totalAmount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category,
      value: totalAmount
    };
  }).filter(item => item.value > 0);
  
  // For pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];
  
  // --------------- PERSON BREAKDOWN ---------------
  // Prepare data for person spending over time chart
  const personMonthlyData = monthNames.map((month, index) => {
    const monthExpenses = filteredExpenses.filter(
      expense => new Date(expense.date).getMonth() === index
    );
    
    const hasnaaAmount = monthExpenses
      .filter(expense => expense.paidBy === 'Hasnaa')
      .reduce((sum, expense) => sum + expense.amount, 0);
      
    const achrafAmount = monthExpenses
      .filter(expense => expense.paidBy === 'Achraf')
      .reduce((sum, expense) => sum + expense.amount, 0);
      
    return {
      name: month,
      Hasnaa: hasnaaAmount,
      Achraf: achrafAmount
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
          <TabsTrigger value="category">Category Analysis</TabsTrigger>
          <TabsTrigger value="person">Person Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending in {year}</CardTitle>
              <CardDescription>
                Overview of expenses by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="Hasnaa" fill="#8884d8" name="Hasnaa" />
                    <Bar dataKey="Achraf" fill="#82ca9d" name="Achraf" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">Total Spending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">Hasnaa's Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${filteredExpenses
                        .filter(expense => expense.paidBy === 'Hasnaa')
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">Achraf's Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${filteredExpenses
                        .filter(expense => expense.paidBy === 'Achraf')
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
              <CardDescription>
                Breakdown of expenses by category for {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex justify-center">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No expense data available for {year}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Top Categories</h3>
                <div className="space-y-2">
                  {[...categoryData]
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map((category, index) => (
                      <div key={category.name} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span>{category.name}</span>
                        </div>
                        <span className="font-medium">${category.value.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="person" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Person Comparison</CardTitle>
              <CardDescription>
                Compare spending patterns between profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={personMonthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Hasnaa" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Achraf" 
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Hasnaa', 'Achraf'].map(person => {
                  const personExpenses = filteredExpenses.filter(
                    expense => expense.paidBy === person
                  );
                  
                  const totalSpent = personExpenses.reduce(
                    (sum, expense) => sum + expense.amount, 
                    0
                  );
                  
                  // Get top categories for this person
                  const personCategories = categories.map(category => {
                    const amount = personExpenses
                      .filter(expense => expense.category === category)
                      .reduce((sum, expense) => sum + expense.amount, 0);
                    
                    return { category, amount };
                  })
                  .filter(item => item.amount > 0)
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 3);
                  
                  return (
                    <Card key={person}>
                      <CardHeader className="pb-2">
                        <CardTitle>{person}'s Spending</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-2xl font-bold">
                            ${totalSpent.toFixed(2)}
                          </div>
                          
                          {personCategories.length > 0 ? (
                            <>
                              <div className="text-sm font-medium">Top Categories:</div>
                              <div className="space-y-2">
                                {personCategories.map(item => (
                                  <div key={item.category} className="flex justify-between">
                                    <span>{item.category}</span>
                                    <span className="font-medium">${item.amount.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-500">No expenses recorded</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
