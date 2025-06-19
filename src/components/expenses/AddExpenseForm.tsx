
import React, { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';

// Use this function to format date to YYYY-MM-DD for the date input
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AddExpenseForm = () => {
  const { addExpense } = useExpenses();
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [paidBy, setPaidBy] = useState('Hasnaa');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    "Rent", "Utilities", "Groceries", "Dining", "Transportation", 
    "Entertainment", "Health", "Shopping", "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setLoading(false);
      return;
    }
    
    await addExpense({
      amount: amountValue,
      category,
      date: new Date(date).toISOString(),
      paid_by: paidBy,
      notes
    });
    
    // Reset form
    setAmount('');
    setCategory('Groceries');
    setDate(formatDateForInput(new Date()));
    setNotes('');
    setLoading(false);
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
          <Select value={category} onValueChange={setCategory}>
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
          <Label htmlFor="paidBy">{t('paidBy')}</Label>
          <Select value={paidBy} onValueChange={setPaidBy}>
            <SelectTrigger id="paidBy">
              <SelectValue placeholder={t('paidBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hasnaa">Hasnaa</SelectItem>
              <SelectItem value="Achraf">Achraf</SelectItem>
            </SelectContent>
          </Select>
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
