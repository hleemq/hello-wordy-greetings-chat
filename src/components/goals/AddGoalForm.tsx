
import React, { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddGoalFormProps {
  onSuccess?: () => void;
}

// Use this function to format date to YYYY-MM-DD for the date input
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate a default deadline 6 months from today
const getDefaultDeadline = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  return formatDateForInput(date);
};

const AddGoalForm: React.FC<AddGoalFormProps> = ({ onSuccess }) => {
  const { addGoal } = useGoals();
  const { t } = useLanguage();
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState(getDefaultDeadline());
  const [priority, setPriority] = useState('Important-NotUrgent');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const targetAmountValue = parseFloat(targetAmount);
    
    if (isNaN(targetAmountValue) || targetAmountValue <= 0) {
      setLoading(false);
      return;
    }
    
    await addGoal({
      name,
      target_amount: targetAmountValue,
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
          placeholder={t('goalNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">{t('targetAmount')} (MAD)</Label>
        <Input
          id="targetAmount"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          required
        />
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
          {loading ? t('adding') : t('addGoal')}
        </Button>
      </div>
    </form>
  );
};

export default AddGoalForm;
