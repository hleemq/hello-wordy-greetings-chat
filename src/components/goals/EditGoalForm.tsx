
import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';
import { Goal, GoalPriority } from '@/types/finance';

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
  const { dispatch } = useFinance();
  
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount.toString());
  const [savedAmount, setSavedAmount] = useState(goal.savedAmount.toString());
  const [deadline, setDeadline] = useState(formatDateForInput(new Date(goal.deadline)));
  const [priority, setPriority] = useState<GoalPriority>(goal.priority);

  // Update form if goal changes
  useEffect(() => {
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setSavedAmount(goal.savedAmount.toString());
    setDeadline(formatDateForInput(new Date(goal.deadline)));
    setPriority(goal.priority);
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetAmountValue = parseFloat(targetAmount);
    const savedAmountValue = parseFloat(savedAmount);
    
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
    
    const updatedGoal: Goal = {
      ...goal,
      name,
      targetAmount: targetAmountValue,
      savedAmount: savedAmountValue,
      deadline: new Date(deadline),
      priority
    };
    
    dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
    
    toast({
      title: "Goal updated",
      description: `Changes to "${name}" have been saved.`
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
            step="0.01"
            min="0"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="savedAmount">Saved Amount ($)</Label>
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
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EditGoalForm;
