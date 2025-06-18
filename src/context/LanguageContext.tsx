
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

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
    'edit': 'Edit',
    'update': 'Update the details for',
    'cancel': 'Cancel',
    'saveChanges': 'Save',
    'deleteAction': 'Delete',
    'invalidAmount': 'Invalid amount',
    'enterValidAmount': 'Please enter a valid positive number',
    'enterValidNonNegative': 'Please enter a valid non-negative number',
    'invalidAmounts': 'Invalid amounts',
    'savedGreaterThanTarget': 'Saved amount cannot be greater than target amount',
    'goalCreated': 'Goal created',
    'hasBeenAdded': 'has been added to your goals',
    'goalUpdated': 'Goal updated',
    'changesTo': 'Changes to',
    'saved': 'saved',
    'selectPriority': 'Select priority',
    'goalNamePlaceholder': 'e.g., Vacation Fund, New Car, Emergency Fund',
    'of': 'of',
    'monthsLeft': 'months remaining',
    'importantUrgent': 'Important & Urgent',
    'importantNotUrgent': 'Important, Not Urgent',
    'urgentNotImportant': 'Urgent, Not Important',
    'notImportantOrUrgent': 'Not Important or Urgent',
    'due': 'Due',
    'saveAction': 'Save',
    'monthLabel': 'month',
    'complete': 'complete',
    'monthsRemaining': 'months left',
    'noSavingsGoals': 'No savings goals added yet',
    'quickAddExpense': 'Quick Add Expense',
    'priorityMatrixExplanation': 'Priority Matrix Explanation',
    'priorityHelpTooltip': 'Learn how to prioritize your saving goals effectively',
    
    // Priority explanations
    'importantUrgentExplanation': 'Needs immediate attention. These goals are crucial and time-sensitive, like emergency funds or important pending deadlines.',
    'importantNotUrgentExplanation': 'Plan for these. Important for long-term success but not time-pressured, like retirement savings or education funds.',
    'urgentNotImportantExplanation': 'Delegate if possible. Time-sensitive but less important goals that might be nice to achieve soon.',
    'notImportantOrUrgentExplanation': 'Consider these last. Goals that are neither crucial nor time-sensitive, like luxury purchases or optional upgrades.',
    
    // Dashboard specific
    'balanceSummary': 'Balance Summary',
    'currentBalance': 'Current Balance',
    'balanceTooltip': 'This shows how expenses are split between Hasnaa and Achraf',
    'hasnaaPaid': 'Hasnaa Paid',
    'achrafPaid': 'Achraf Paid',
    'owes': 'owes',
    'balancedExpenses': 'Expenses are balanced',
    'monthlySpending': 'Monthly Spending',
    'overviewFor': 'Overview for',
    'totalSpentThisMonth': 'Total spent this month',
    'recentExpenses': 'Recent Expenses',
    'by': 'by',
    'noExpensesRecorded': 'No expenses recorded yet',
    'goalProgress': 'Goal Progress',
    'trackSavingsGoals': 'Track your savings goals',
    'goalProgressTooltip': 'This shows your progress towards your savings goals',
    'saveMontly': 'Save',
    'monthPeriod': 'month',
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
    'edit': 'تعديل',
    'update': 'تحديث تفاصيل',
    'cancel': 'إلغاء',
    'saveChanges': 'حفظ',
    'deleteAction': 'حذف',
    'invalidAmount': 'مبلغ غير صالح',
    'enterValidAmount': 'الرجاء إدخال رقم إيجابي صالح',
    'enterValidNonNegative': 'الرجاء إدخال رقم غير سالب صالح',
    'invalidAmounts': 'مبالغ غير صالحة',
    'savedGreaterThanTarget': 'لا يمكن أن يكون المبلغ المدخر أكبر من المبلغ المستهدف',
    'goalCreated': 'تم إنشاء الهدف',
    'hasBeenAdded': 'تمت إضافته إلى أهدافك',
    'goalUpdated': 'تم تحديث الهدف',
    'changesTo': 'تم حفظ التغييرات على',
    'saved': 'تم الحفظ',
    'selectPriority': 'اختر الأولوية',
    'goalNamePlaceholder': 'مثال: صندوق العطلات، سيارة جديدة، صندوق الطوارئ',
    'of': 'من',
    'monthsLeft': 'شهر متبقي',
    'importantUrgent': 'مهم وعاجل',
    'importantNotUrgent': 'مهم، غير عاجل',
    'urgentNotImportant': 'عاجل، غير مهم',
    'notImportantOrUrgent': 'غير مهم أو عاجل',
    'due': 'تاريخ الاستحقاق',
    'saveAction': 'توفير',
    'monthLabel': 'الشهر',
    'complete': 'مكتمل',
    'monthsRemaining': 'شهر متبقي',
    'noSavingsGoals': 'لم تتم إضافة أهداف توفير بعد',
    'quickAddExpense': 'إضافة مصروف سريع',
    'priorityMatrixExplanation': 'شرح مصفوفة الأولويات',
    'priorityHelpTooltip': 'تعلم كيفية تحديد أولويات أهداف التوفير الخاصة بك بشكل فعال',
    
    // Priority explanations
    'importantUrgentExplanation': 'تحتاج إلى اهتمام فوري. هذه الأهداف حاسمة وحساسة للوقت، مثل صناديق الطوارئ أو المواعيد النهائية المعلقة المهمة.',
    'importantNotUrgentExplanation': 'خطط لهذه الأهداف. مهمة للنجاح على المدى الطويل ولكنها ليست تحت ضغط الوقت، مثل مدخرات التقاعد أو صناديق التعليم.',
    'urgentNotImportantExplanation': 'فوض إذا أمكن. أهداف حساسة للوقت ولكنها أقل أهمية قد يكون من الجيد تحقيقها قريبًا.',
    'notImportantOrUrgentExplanation': 'ضع هذه في الاعتبار في النهاية. الأهداف التي ليست حاسمة أو حساسة للوقت، مثل المشتريات الفاخرة أو الترقيات الاختيارية.',
    
    // Dashboard specific
    'balanceSummary': 'ملخص الرصيد',
    'currentBalance': 'الرصيد الحالي',
    'balanceTooltip': 'يوضح هذا كيف يتم تقسيم النفقات بين حسناء وأشرف',
    'hasnaaPaid': 'دفعت حسناء',
    'achrafPaid': 'دفع أشرف',
    'owes': 'مدين لـ',
    'balancedExpenses': 'النفقات متوازنة',
    'monthlySpending': 'الإنفاق الشهري',
    'overviewFor': 'نظرة عامة لشهر',
    'totalSpentThisMonth': 'إجمالي الإنفاق هذا الشهر',
    'recentExpenses': 'المصاريف الأخيرة',
    'by': 'بواسطة',
    'noExpensesRecorded': 'لم يتم تسجيل أي مصاريف بعد',
    'goalProgress': 'تقدم الهدف',
    'trackSavingsGoals': 'تتبع أهداف التوفير الخاصة بك',
    'goalProgressTooltip': 'يوضح هذا تقدمك نحو أهداف التوفير الخاصة بك',
    'saveMontly': 'توفير',
    'monthPeriod': 'شهر',
  }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageType>('ar');

  useEffect(() => {
    // Set RTL direction when language is Arabic
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

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
