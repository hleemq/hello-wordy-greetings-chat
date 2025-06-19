
import React, { useState, useEffect } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Goal } from '@/hooks/useGoals';

interface EditGoalFormProps {
  goal: Goal;
  onSuccess?: () => void;
}

// Use this function to format date to YYYY-MM-DD for the date input
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const EditGoalForm: React.FC<EditGoalFormProps> = ({ goal, onSuccess }) => {
  const { updateGoal } = useGoals();
  const { t } = useLanguage();
  
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.target_amount.toString());
  const [savedAmount, setSavedAmount] = useState(goal.saved_amount.toString());
  const [deadline, setDeadline] = useState(formatDateForInput(new Date(goal.deadline)));
  const [priority, setPriority] = useState(goal.priority);
  const [loading, setLoading] = useState(false);

  // Update form if goal changes
  useEffect(() => {
    setName(goal.name);
    setTargetAmount(goal.target_amount.toString());
    setSavedAmount(goal.saved_amount.toString());
    setDeadline(formatDateForInput(new Date(goal.deadline)));
    setPriority(goal.priority);
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const targetAmountValue = parseFloat(targetAmount);
    const savedAmountValue = parseFloat(savedAmount);
    
    if (isNaN(targetAmountValue) || targetAmountValue <= 0) {
      setLoading(false);
      return;
    }
    
    if (isNaN(savedAmountValue) || savedAmountValue < 0) {
      setLoading(false);
      return;
    }
    
    if (savedAmountValue > targetAmountValue) {
      setLoading(false);
      return;
    }
    
    await updateGoal(goal.id, {
      name,
      target_amount: targetAmountValue,
      saved_amount: savedAmountValue,
      deadline: new Date(deadline).toISOString(),
      priority
    });
    
    if (onSuccess) {
      onSuccess();
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('savingsGoal')}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAmount">{t('targetAmount')} (MAD)</Label>
          <Input
            id="targetAmount"
            type="number"
            step="0.01"
            min="0"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="savedAmount">{t('currentSavings')} (MAD)</Label>
          <Input
            id="savedAmount"
            type="number"
            step="0.01"
            min="0"
            value={savedAmount}
            onChange={(e) => setSavedAmount(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deadline">{t('deadline')}</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority">{t('priority')}</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="priority">
              <SelectValue placeholder={t('selectPriority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Important-Urgent">{t('importantUrgent')}</SelectItem>
              <SelectItem value="Important-NotUrgent">{t('importantNotUrgent')}</SelectItem>
              <SelectItem value="NotImportant-Urgent">{t('urgentNotImportant')}</SelectItem>
              <SelectItem value="NotImportant-NotUrgent">{t('notImportantOrUrgent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  );
};

export default EditGoalForm;
