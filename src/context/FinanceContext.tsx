import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Expense, Goal, Profile, Balance } from '@/types/finance';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';

interface FinanceState {
  expenses: Expense[];
  goals: Goal[];
  isLoggedIn: boolean;
  activeProfile: Profile;
  balance: Balance;
  currentView: 'dashboard' | 'expenses' | 'goals' | 'reports';
  loading: boolean;
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
  | { type: 'CHANGE_VIEW', payload: 'dashboard' | 'expenses' | 'goals' | 'reports' };

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
  loading: true
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

  // Fetch expenses from Supabase when component mounts
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
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
        }
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      }
    };
    
    const fetchGoals = async () => {
      try {
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
        }
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    // Fetch data
    fetchExpenses();
    fetchGoals();
    
    // Set up real-time subscription for expenses
    const expensesChannel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses' }, 
        async () => {
          // Refetch expenses on any change
          const { data, error } = await supabase.from('expenses').select('*');
          if (!error && data) {
            const formattedExpenses: Expense[] = data.map(exp => ({
              id: exp.id,
              amount: exp.amount,
              date: new Date(exp.date),
              category: exp.category as any,
              paidBy: exp.paid_by as Profile,
              notes: exp.notes || undefined
            }));
            
            dispatch({ type: 'SET_EXPENSES', payload: formattedExpenses });
          }
        }
      )
      .subscribe();
      
    // Set up real-time subscription for goals
    const goalsChannel = supabase
      .channel('goals-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'goals' }, 
        async () => {
          // Refetch goals on any change
          const { data, error } = await supabase.from('goals').select('*');
          if (!error && data) {
            const formattedGoals: Goal[] = data.map(goal => ({
              id: goal.id,
              name: goal.name,
              targetAmount: goal.target_amount,
              savedAmount: goal.saved_amount,
              deadline: new Date(goal.deadline),
              priority: goal.priority as any
            }));
            
            dispatch({ type: 'SET_GOALS', payload: formattedGoals });
          }
        }
      )
      .subscribe();
    
    return () => {
      // Clean up subscriptions
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(goalsChannel);
    };
  }, []);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
