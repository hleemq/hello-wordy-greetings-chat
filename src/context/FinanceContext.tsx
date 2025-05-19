
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Expense, Goal, Profile, Balance } from '@/types/finance';

interface FinanceState {
  expenses: Expense[];
  goals: Goal[];
  isLoggedIn: boolean;
  activeProfile: Profile;
  balance: Balance;
  currentView: 'dashboard' | 'expenses' | 'goals' | 'reports';
}

type Action = 
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SWITCH_PROFILE', payload: Profile }
  | { type: 'ADD_EXPENSE', payload: Expense }
  | { type: 'DELETE_EXPENSE', payload: string }
  | { type: 'ADD_GOAL', payload: Goal }
  | { type: 'UPDATE_GOAL', payload: Goal }
  | { type: 'DELETE_GOAL', payload: string }
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
};

// Try to load state from localStorage
const loadState = (): FinanceState => {
  try {
    const savedState = localStorage.getItem('financeState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Convert string dates back to Date objects
      const expenses = parsedState.expenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      }));
      
      const goals = parsedState.goals.map((goal: any) => ({
        ...goal,
        deadline: new Date(goal.deadline)
      }));
      
      return {
        ...parsedState,
        expenses,
        goals,
        balance: calculateBalance(expenses),
        isLoggedIn: false // Always start logged out
      };
    }
  } catch (error) {
    console.error('Failed to load state from localStorage', error);
  }
  return initialState;
};

const reducer = (state: FinanceState, action: Action): FinanceState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isLoggedIn: true };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false };
    case 'SWITCH_PROFILE':
      return { ...state, activeProfile: action.payload };
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
  const [state, dispatch] = useReducer(reducer, loadState());

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('financeState', JSON.stringify(state));
  }, [state]);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
