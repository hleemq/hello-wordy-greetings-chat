
import React, { createContext, useState, useContext, ReactNode } from 'react';

type LanguageType = 'en' | 'ar';

type LanguageContextType = {
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    // Dashboard
    'dashboard': 'Dashboard',
    'expenses': 'Expenses',
    'goals': 'Goals',
    'reports': 'Reports',
    'financeTracker': 'Finance Tracker',
    'active': 'Active',
    'logout': 'Log out',
    'language': 'Language',
    
    // Expenses
    'expenseTracker': 'Expense Tracker',
    'monthlySummary': 'Monthly Summary',
    'totalExpenses': 'Total Expenses',
    'whoPaid': 'Who Paid',
    'topCategories': 'Top Categories',
    'addNewExpense': 'Add New Expense',
    'amount': 'Amount (MAD)',
    'category': 'Category',
    'date': 'Date',
    'paidBy': 'Paid by',
    'notes': 'Notes (optional)',
    'addExpense': 'Add Expense',
    'expenseHistory': 'Expense History',
    'allCategories': 'All Categories',
    'description': 'Description',
    'delete': 'Delete this expense',
    
    // Categories
    'rent': 'Rent',
    'utilities': 'Utilities',
    'groceries': 'Groceries',
    'dining': 'Dining',
    'transportation': 'Transportation',
    'entertainment': 'Entertainment',
    'health': 'Health',
    'shopping': 'Shopping',
    'other': 'Other',
    
    // Goals
    'savingsGoal': 'Savings Goal',
    'targetAmount': 'Target Amount',
    'currentSavings': 'Current Savings',
    'deadline': 'Deadline',
    'priority': 'Priority',
    'addGoal': 'Add Goal',
    
    // Reports
    'financialReports': 'Financial Reports',
    'year': 'Year',
    'monthlyBreakdown': 'Monthly Breakdown',
    'categoryAnalysis': 'Category Analysis',
    'personComparison': 'Person Comparison',
    'monthlySpending': 'Monthly Spending in',
    'overview': 'Overview of expenses by month',
    'totalSpending': 'Total Spending',
    'hasnaasTotal': 'Hasnaa\'s Total',
    'achrafsTotal': 'Achraf\'s Total',
    'breakdownByCategory': 'Breakdown of expenses by category for',
    'compareSpending': 'Compare spending patterns between profiles',
    'spending': 'Spending',
    'noExpenseData': 'No expense data available for',
  },
  ar: {
    // Dashboard
    'dashboard': 'لوحة التحكم',
    'expenses': 'المصاريف',
    'goals': 'الأهداف',
    'reports': 'التقارير',
    'financeTracker': 'متتبع المالية',
    'active': 'نشط',
    'logout': 'تسجيل الخروج',
    'language': 'اللغة',
    
    // Expenses
    'expenseTracker': 'متتبع المصاريف',
    'monthlySummary': 'ملخص شهري',
    'totalExpenses': 'إجمالي المصاريف',
    'whoPaid': 'من دفع',
    'topCategories': 'أهم الفئات',
    'addNewExpense': 'إضافة مصروف جديد',
    'amount': 'المبلغ (درهم)',
    'category': 'الفئة',
    'date': 'التاريخ',
    'paidBy': 'دفع بواسطة',
    'notes': 'ملاحظات (اختياري)',
    'addExpense': 'إضافة مصروف',
    'expenseHistory': 'سجل المصاريف',
    'allCategories': 'جميع الفئات',
    'description': 'الوصف',
    'delete': 'حذف هذا المصروف',
    
    // Categories
    'rent': 'الإيجار',
    'utilities': 'المرافق',
    'groceries': 'البقالة',
    'dining': 'تناول الطعام',
    'transportation': 'المواصلات',
    'entertainment': 'الترفيه',
    'health': 'الصحة',
    'shopping': 'التسوق',
    'other': 'أخرى',
    
    // Goals
    'savingsGoal': 'هدف الادخار',
    'targetAmount': 'المبلغ المستهدف',
    'currentSavings': 'المدخرات الحالية',
    'deadline': 'الموعد النهائي',
    'priority': 'الأولوية',
    'addGoal': 'إضافة هدف',
    
    // Reports
    'financialReports': 'التقارير المالية',
    'year': 'السنة',
    'monthlyBreakdown': 'التقسيم الشهري',
    'categoryAnalysis': 'تحليل الفئات',
    'personComparison': 'مقارنة الأشخاص',
    'monthlySpending': 'الإنفاق الشهري في',
    'overview': 'نظرة عامة على المصاريف حسب الشهر',
    'totalSpending': 'إجمالي الإنفاق',
    'hasnaasTotal': 'إجمالي حسناء',
    'achrafsTotal': 'إجمالي أشرف',
    'breakdownByCategory': 'تقسيم المصاريف حسب الفئة لـ',
    'compareSpending': 'مقارنة أنماط الإنفاق بين الملفات الشخصية',
    'spending': 'الإنفاق',
    'noExpenseData': 'لا توجد بيانات مصاريف متاحة لـ',
  }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageType>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
