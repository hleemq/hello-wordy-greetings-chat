import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Expense, Goal, Profile, Balance } from '@/types/finance';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { storeData, getAllData, queueOperation } from '@/utils/offlineStorage';

interface FinanceState {
  expenses: Expense[];
  goals: Goal[];
  isLoggedIn: boolean;
  activeProfile: Profile;
  balance: Balance;
  currentView: 'dashboard' | 'expenses' | 'goals' | 'reports' | 'settings';
  loading: boolean;
  isOnline: boolean;
}

type Action = 
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SWITCH_PROFILE', payload: Profile }
  | { type: 'ADD_EXPENSE', payload: Expense }
  | { type: 'SET_EXPENSES', payload: Expense[] }
  | { type: 'DELETE_EXPENSE', payload: string }
  | { type: 'ADD_GOAL', payload: Goal }
  | { type: 'SET_GOALS', payload: Goal[] }
  | { type: 'UPDATE_GOAL', payload: Goal }
  | { type: 'DELETE_GOAL', payload: string }
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_ONLINE_STATUS', payload: boolean }
  | { type: 'CHANGE_VIEW', payload: 'dashboard' | 'expenses' | 'goals' | 'reports' | 'settings' };

const calculateBalance = (expenses: Expense[]): Balance => {
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
  let whoOwes: Profile | null = null;
  let amount = 0;

  if (difference > 0) {
    whoOwes = 'Achraf';
    amount = difference / 2;
  } else if (difference < 0) {
    whoOwes = 'Hasnaa';
    amount = Math.abs(difference) / 2;
  }

  return { hasnaaPaid, achrafPaid, difference, whoOwes, amount };
};

const initialState: FinanceState = {
  expenses: [],
  goals: [],
  isLoggedIn: false,
  activeProfile: 'Hasnaa',
  balance: { hasnaaPaid: 0, achrafPaid: 0, difference: 0, whoOwes: null, amount: 0 },
  currentView: 'dashboard',
  loading: true,
  isOnline: navigator.onLine
};

const reducer = (state: FinanceState, action: Action): FinanceState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isLoggedIn: true };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false };
    case 'SWITCH_PROFILE':
      return { ...state, activeProfile: action.payload };
    case 'SET_EXPENSES': {
      return { 
        ...state, 
        expenses: action.payload,
        balance: calculateBalance(action.payload)
      };
    }
    case 'ADD_EXPENSE': {
      const newExpenses = [...state.expenses, action.payload];
      return { 
        ...state, 
        expenses: newExpenses,
        balance: calculateBalance(newExpenses)
      };
    }
    case 'DELETE_EXPENSE': {
      const newExpenses = state.expenses.filter(e => e.id !== action.payload);
      return { 
        ...state, 
        expenses: newExpenses,
        balance: calculateBalance(newExpenses)
      };
    }
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL': {
      const newGoals = state.goals.map(g => 
        g.id === action.payload.id ? action.payload : g
      );
      return { ...state, goals: newGoals };
    }
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'CHANGE_VIEW':
      return { ...state, currentView: action.payload };
    default:
      return state;
  }
};

const FinanceContext = createContext<{
  state: FinanceState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Function to fetch expenses with offline support
  const fetchExpenses = async () => {
    try {
      if (navigator.onLine) {
        // Online mode: Fetch from Supabase
        const { data: expenses, error } = await supabase
          .from('expenses')
          .select('*');
          
        if (error) {
          console.error("Error fetching expenses:", error);
          toast({
            title: "Error fetching expenses",
            description: error.message,
            variant: "destructive"
          });
          
          // Fall back to local data
          const localExpenses = await getAllData<Expense>('expenses');
          if (localExpenses.length > 0) {
            dispatch({ type: 'SET_EXPENSES', payload: localExpenses });
          }
        } else {
          // Convert to Expense type with proper date objects
          const formattedExpenses: Expense[] = expenses.map(exp => ({
            id: exp.id,
            amount: exp.amount,
            date: new Date(exp.date),
            category: exp.category as any,
            paidBy: exp.paid_by as Profile,
            notes: exp.notes || undefined
          }));
          
          dispatch({ type: 'SET_EXPENSES', payload: formattedExpenses });
          
          // Update local storage with fresh data
          formattedExpenses.forEach(async (expense) => {
            await storeData('expenses', expense);
          });
        }
      } else {
        // Offline mode: Use local data
        const localExpenses = await getAllData<Expense>('expenses');
        if (localExpenses.length > 0) {
          dispatch({ type: 'SET_EXPENSES', payload: localExpenses });
        }
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      // Try to get from local storage as fallback
      try {
        const localExpenses = await getAllData<Expense>('expenses');
        if (localExpenses.length > 0) {
          dispatch({ type: 'SET_EXPENSES', payload: localExpenses });
        }
      } catch (localError) {
        console.error("Failed to get local expenses:", localError);
      }
    }
  };
  
  // Function to fetch goals with offline support
  const fetchGoals = async () => {
    try {
      if (navigator.onLine) {
        // Online mode: Fetch from Supabase
        const { data: goals, error } = await supabase
          .from('goals')
          .select('*');
          
        if (error) {
          console.error("Error fetching goals:", error);
          toast({
            title: "Error fetching goals",
            description: error.message,
            variant: "destructive"
          });
          
          // Fall back to local data
          const localGoals = await getAllData<Goal>('goals');
          if (localGoals.length > 0) {
            dispatch({ type: 'SET_GOALS', payload: localGoals });
          }
        } else {
          // Convert to Goal type with proper date objects
          const formattedGoals: Goal[] = goals.map(goal => ({
            id: goal.id,
            name: goal.name,
            targetAmount: goal.target_amount,
            savedAmount: goal.saved_amount,
            deadline: new Date(goal.deadline),
            priority: goal.priority as any
          }));
          
          dispatch({ type: 'SET_GOALS', payload: formattedGoals });
          
          // Update local storage with fresh data
          formattedGoals.forEach(async (goal) => {
            await storeData('goals', goal);
          });
        }
      } else {
        // Offline mode: Use local data
        const localGoals = await getAllData<Goal>('goals');
        if (localGoals.length > 0) {
          dispatch({ type: 'SET_GOALS', payload: localGoals });
        }
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      // Try to get from local storage as fallback
      try {
        const localGoals = await getAllData<Goal>('goals');
        if (localGoals.length > 0) {
          dispatch({ type: 'SET_GOALS', payload: localGoals });
        }
      } catch (localError) {
        console.error("Failed to get local goals:", localError);
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
      // When we're back online, refresh data
      fetchExpenses();
      fetchGoals();
    };
    
    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
      // Show toast notification
      toast({
        title: "You are offline",
        description: "The app will continue to work with locally stored data.",
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Listen for service worker sync messages
  useEffect(() => {
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        // Refresh data after sync
        fetchExpenses();
        fetchGoals();
        
        toast({
          title: "Data synchronized",
          description: "Your data has been successfully synchronized with the server.",
        });
      }
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSyncMessage);
    }
    
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSyncMessage);
      }
    };
  }, []);

  // Fetch initial data and set up polling
  useEffect(() => {
    // Initial data fetch
    dispatch({ type: 'SET_LOADING', payload: true });
    fetchExpenses();
    fetchGoals();
    
    // Set up polling for data updates every 5 seconds (only when online)
    const pollingInterval = setInterval(() => {
      if (navigator.onLine) {
        fetchExpenses();
        fetchGoals();
      }
    }, 5000);
    
    return () => {
      // Clean up polling interval
      clearInterval(pollingInterval);
    };
  }, []);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
