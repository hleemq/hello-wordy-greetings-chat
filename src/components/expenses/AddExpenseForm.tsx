
import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';
import { ExpenseCategory } from '@/types/finance';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Use this function to format date to YYYY-MM-DD for the date input
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AddExpenseForm = () => {
  const { state, dispatch } = useFinance();
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Groceries');
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const categories: ExpenseCategory[] = [
    "Rent", "Utilities", "Groceries", "Dining", "Transportation", 
    "Entertainment", "Health", "Shopping", "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    
    try {
      // Create expense object for database - with date as ISO string
      const expenseData = {
        amount: amountValue,
        category,
        date: new Date(date).toISOString(),
        paid_by: state.activeProfile,
        notes
      };
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Add to local state
      const newExpense = {
        id: data.id,
        amount: amountValue,
        category,
        date: new Date(data.date),
        paidBy: state.activeProfile,
        notes
      };
      
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      
      // Reset form
      setAmount('');
      setCategory('Groceries');
      setDate(formatDateForInput(new Date()));
      setNotes('');
      
      toast({
        title: "Expense added",
        description: `${amountValue.toFixed(2)} MAD for ${t(category.toLowerCase())} has been added.`
      });
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error adding expense",
        description: error.message || "An error occurred while adding the expense.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount">{t('amount')}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enter the amount spent</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">{t('category')}</Label>
          <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
            <SelectTrigger id="category">
              <SelectValue placeholder={t('category')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{t(cat.toLowerCase())}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">{t('date')}</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t('paidBy')}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>This will use your active profile ({state.activeProfile})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 text-gray-800">
            {state.activeProfile}
            <span className="text-xs text-gray-500 ml-2">
              (You can switch profiles in the top nav)
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">{t('notes')}</Label>
        <Textarea 
          id="notes"
          placeholder="Add any additional details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[80px]"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Adding...' : t('addExpense')}
      </Button>
    </form>
  );
};

export default AddExpenseForm;
