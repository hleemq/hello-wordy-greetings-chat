
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  paid_by: string;
  notes?: string;
  user_id: string;
  created_at: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setExpenses(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  return {
    expenses,
    loading,
    addExpense,
    refetch: fetchExpenses,
  };
};
