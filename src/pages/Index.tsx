
import { FinanceProvider } from '@/context/FinanceContext';
import Layout from '@/components/layout/Layout';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Toaster } from '@/components/ui/toaster';

// Create sample data if the app is launched for the first time
const createSampleData = () => {
  // Check if data already exists in localStorage
  if (localStorage.getItem('financeState')) {
    return;
  }
  
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  // Sample expenses data
  const expenses = [
    {
      id: uuidv4(),
      amount: 1200,
      date: oneMonthAgo,
      category: "Rent",
      paidBy: "Hasnaa",
      notes: "Monthly rent payment"
    },
    {
      id: uuidv4(),
      amount: 150,
      date: today,
      category: "Groceries",
      paidBy: "Achraf",
      notes: "Weekly grocery shopping"
    },
    {
      id: uuidv4(),
      amount: 80,
      date: today,
      category: "Utilities",
      paidBy: "Achraf",
      notes: "Electricity bill"
    },
    {
      id: uuidv4(),
      amount: 65,
      date: twoMonthsAgo,
      category: "Dining",
      paidBy: "Hasnaa",
      notes: "Dinner at Italian restaurant"
    }
  ];
  
  // Sample goals data
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  const goals = [
    {
      id: uuidv4(),
      name: "Emergency Fund",
      targetAmount: 5000,
      savedAmount: 1500,
      deadline: sixMonthsFromNow,
      priority: "Important-Urgent"
    },
    {
      id: uuidv4(),
      name: "Vacation",
      targetAmount: 2000,
      savedAmount: 800,
      deadline: oneYearFromNow,
      priority: "Important-NotUrgent"
    }
  ];
  
  // Calculate initial balance
  let hasnaaPaid = 0;
  let achrafPaid = 0;
  
  expenses.forEach((expense) => {
    if (expense.paidBy === 'Hasnaa') {
      hasnaaPaid += expense.amount;
    } else {
      achrafPaid += expense.amount;
    }
  });
  
  const difference = hasnaaPaid - achrafPaid;
  let whoOwes = null;
  let amount = 0;
  
  if (difference > 0) {
    whoOwes = 'Achraf';
    amount = difference / 2;
  } else if (difference < 0) {
    whoOwes = 'Hasnaa';
    amount = Math.abs(difference) / 2;
  }
  
  const balance = { hasnaaPaid, achrafPaid, difference, whoOwes, amount };
  
  // Create initial state
  const initialState = {
    expenses,
    goals,
    isLoggedIn: false,
    activeProfile: 'Hasnaa',
    balance,
    currentView: 'dashboard'
  };
  
  // Store in localStorage
  localStorage.setItem('financeState', JSON.stringify(initialState));
};

const Index = () => {
  // Set up sample data on first load
  useEffect(() => {
    createSampleData();
  }, []);

  return (
    <>
      <FinanceProvider>
        <Layout />
        <Toaster />
      </FinanceProvider>
    </>
  );
};

export default Index;
