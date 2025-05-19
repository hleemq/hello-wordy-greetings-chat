
export type Profile = "Hasnaa" | "Achraf";

export type ExpenseCategory = 
  | "Rent" 
  | "Utilities" 
  | "Groceries" 
  | "Dining" 
  | "Transportation" 
  | "Entertainment" 
  | "Health" 
  | "Shopping" 
  | "Other";

export interface Expense {
  id: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
  paidBy: Profile;
  notes?: string;
}

export type GoalPriority = 
  | "Important-Urgent" 
  | "Important-NotUrgent" 
  | "NotImportant-Urgent" 
  | "NotImportant-NotUrgent";

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date;
  priority: GoalPriority;
}

export interface Balance {
  hasnaaPaid: number;
  achrafPaid: number;
  difference: number;
  whoOwes: Profile | null;
  amount: number;
}
