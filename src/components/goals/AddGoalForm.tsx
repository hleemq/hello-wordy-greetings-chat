
import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { GoalPriority } from '@/types/finance';

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
  const { dispatch } = useFinance();
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('0');
  const [deadline, setDeadline] = useState(getDefaultDeadline());
  const [priority, setPriority] = useState<GoalPriority>('Important-NotUrgent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetAmountValue = parseFloat(targetAmount);
    const savedAmountValue = parseFloat(savedAmount) || 0;
    
    if (isNaN(targetAmountValue) || targetAmountValue <= 0) {
      toast({
        title: "Invalid target amount",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }
    
    if (isNaN(savedAmountValue) || savedAmountValue < 0) {
      toast({
        title: "Invalid saved amount",
        description: "Please enter a valid non-negative number",
        variant: "destructive"
      });
      return;
    }
    
    if (savedAmountValue > targetAmountValue) {
      toast({
        title: "Invalid amounts",
        description: "Saved amount cannot be greater than target amount",
        variant: "destructive"
      });
      return;
    }
    
    const goal = {
      id: uuidv4(),
      name,
      targetAmount: targetAmountValue,
      savedAmount: savedAmountValue,
      deadline: new Date(deadline),
      priority
    };
    
    dispatch({ type: 'ADD_GOAL', payload: goal });
    
    toast({
      title: "Goal created",
      description: `"${name}" has been added to your goals.`
    });
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          placeholder="e.g., Vacation Fund, New Car, Emergency Fund"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount ($)</Label>
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
        
        <div className="space-y-2">
          <Label htmlFor="savedAmount">Already Saved ($)</Label>
          <Input
            id="savedAmount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={savedAmount}
            onChange={(e) => setSavedAmount(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deadline">Target Date</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as GoalPriority)}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Important-Urgent">Important & Urgent</SelectItem>
              <SelectItem value="Important-NotUrgent">Important, Not Urgent</SelectItem>
              <SelectItem value="NotImportant-Urgent">Urgent, Not Important</SelectItem>
              <SelectItem value="NotImportant-NotUrgent">Not Important or Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">
          Create Goal
        </Button>
      </div>
    </form>
  );
};

export default AddGoalForm;
