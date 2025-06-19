
import React, { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import AddGoalForm from './AddGoalForm';
import EditGoalForm from './EditGoalForm';
import { Goal } from '@/hooks/useGoals';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const GoalsPage = () => {
  const { goals, loading, refetch } = useGoals();
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const priorityMatrix = {
    "Important-Urgent": { 
      label: t('importantUrgent'), 
      color: "bg-red-100 text-red-800", 
      borderColor: "border-red-200",
      explanation: t('importantUrgentExplanation')
    },
    "Important-NotUrgent": { 
      label: t('importantNotUrgent'), 
      color: "bg-blue-100 text-blue-800", 
      borderColor: "border-blue-200",
      explanation: t('importantNotUrgentExplanation')
    },
    "NotImportant-Urgent": { 
      label: t('urgentNotImportant'), 
      color: "bg-yellow-100 text-yellow-800", 
      borderColor: "border-yellow-200",
      explanation: t('urgentNotImportantExplanation')
    },
    "NotImportant-NotUrgent": { 
      label: t('notImportantOrUrgent'), 
      color: "bg-gray-100 text-gray-800", 
      borderColor: "border-gray-200",
      explanation: t('notImportantOrUrgentExplanation')
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: t('goalDeleted'),
        description: t('goalDeletedDescription')
      });
      
      refetch();
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      toast({
        title: t('errorDeletingGoal'),
        description: error.message || t('anErrorOccurred'),
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditButtonClick = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const priorityOrder = {
    "Important-Urgent": 0,
    "Important-NotUrgent": 1,
    "NotImportant-Urgent": 2,
    "NotImportant-NotUrgent": 3
  };

  // Group goals by priority
  const goalsByPriority = goals.reduce((acc, goal) => {
    if (!acc[goal.priority]) {
      acc[goal.priority] = [];
    }
    acc[goal.priority].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // Sort priorities by importance
  const sortedPriorities = Object.keys(goalsByPriority).sort(
    (a, b) => priorityOrder[a as keyof typeof priorityOrder] - priorityOrder[b as keyof typeof priorityOrder]
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">{t('loadingGoals')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t('savingsGoal')}</h1>
          <p className="text-gray-600 mt-1">{t('trackSavingsGoals')}</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0" id="add-goal-button">
              <PlusCircle className="h-4 w-4 mr-2" /> {t('addGoal')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('addGoal')}</DialogTitle>
              <DialogDescription>
                {t('trackSavingsGoals')}
              </DialogDescription>
            </DialogHeader>
            <AddGoalForm onSuccess={() => {
              setDialogOpen(false);
              refetch();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {goals.length > 0 ? (
        <>
          {/* Priority Matrix Explanation */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t('priorityMatrixExplanation')}</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>{t('priorityHelpTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription>{t('trackSavingsGoals')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(priorityMatrix).map(([key, value]) => (
                  <div key={key} className={`p-4 rounded-md ${value.color} border ${value.borderColor}`}>
                    <h3 className="font-medium mb-1">{value.label}</h3>
                    <p className="text-sm">{value.explanation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals by Priority */}
          {sortedPriorities.map(priority => (
            <div key={priority} className="mb-8">
              <div className={`inline-flex items-center px-3 py-1 rounded-lg mb-4 ${priorityMatrix[priority as keyof typeof priorityMatrix].color}`}>
                <h2 className="text-lg font-semibold">{priorityMatrix[priority as keyof typeof priorityMatrix].label}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goalsByPriority[priority].map(goal => {
                  const progress = Math.round((goal.saved_amount / goal.target_amount) * 100);
                  const monthsLeft = Math.max(
                    1,
                    Math.ceil(
                      (new Date(goal.deadline).getTime() - new Date().getTime()) / 
                      (30 * 24 * 60 * 60 * 1000)
                    )
                  );
                  const monthlySavingsNeeded = (goal.target_amount - goal.saved_amount) / monthsLeft;
                  
                  return (
                    <Card key={goal.id} className={`border-l-4 ${priorityMatrix[goal.priority as keyof typeof priorityMatrix].borderColor}`}>
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                          <CardTitle>{goal.name}</CardTitle>
                          <CardDescription>
                            {t('due')} {new Date(goal.deadline).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditButtonClick(goal)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('edit')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => deleteGoal(goal.id)}
                                  disabled={deletingId === goal.id}
                                >
                                  {deletingId === goal.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('deleteAction')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between flex-wrap gap-2">
                            <div>
                              <div className="text-sm text-gray-500">{t('goalProgress')}</div>
                              <div className="text-lg font-semibold">{progress}%</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">{t('currentSavings')}</div>
                              <div className="text-lg font-semibold">
                                {goal.saved_amount.toFixed(2)} MAD <span className="text-xs text-gray-500">{t('of')} {goal.target_amount.toFixed(2)} MAD</span>
                              </div>
                            </div>
                          </div>
                          
                          <Progress value={progress} className="h-2" />
                          
                          <div className="flex justify-between text-sm pt-1 flex-wrap gap-2">
                            <div className="text-gray-500">{monthsLeft} {t('monthsRemaining')}</div>
                            <div className="font-medium">
                              {t('saveAction')} {monthlySavingsNeeded.toFixed(2)} MAD/{t('monthLabel')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-2">{t('noSavingsGoals')}</h3>
            <p className="text-gray-600 mb-6">
              {t('trackSavingsGoals')}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" /> {t('addGoal')}
            </Button>
          </div>
        </div>
      )}
      
      {/* Edit Goal Dialog */}
      {editingGoal && (
        <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('edit')}</DialogTitle>
              <DialogDescription>
                {t('update')} "{editingGoal.name}"
              </DialogDescription>
            </DialogHeader>
            <EditGoalForm goal={editingGoal} onSuccess={() => {
              setEditingGoal(null);
              refetch();
            }} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GoalsPage;
