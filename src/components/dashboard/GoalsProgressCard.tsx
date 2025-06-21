
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle } from 'lucide-react';
import { Goal } from '@/hooks/useGoals';

interface GoalsProgressCardProps {
  priorityGoals: Goal[];
}

export const GoalsProgressCard = ({ priorityGoals }: GoalsProgressCardProps) => {
  const { t } = useLanguage();

  const priorityLabels = {
    "Important-Urgent": t('importantUrgent'),
    "Important-NotUrgent": t('importantNotUrgent'),
    "NotImportant-Urgent": t('urgentNotImportant'),
    "NotImportant-NotUrgent": t('notImportantOrUrgent')
  };
  
  const priorityColors = {
    "Important-Urgent": "bg-red-100 text-red-800",
    "Important-NotUrgent": "bg-blue-100 text-blue-800",
    "NotImportant-Urgent": "bg-yellow-100 text-yellow-800",
    "NotImportant-NotUrgent": "bg-gray-100 text-gray-800"
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('goalProgress')}</CardTitle>
          <CardDescription>{t('trackSavingsGoals')}</CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-80">
              <p>{t('goalProgressTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        {priorityGoals.length > 0 ? (
          <div className="space-y-4">
            {priorityGoals.map(goal => {
              const progress = Math.round((goal.saved_amount / goal.target_amount) * 100);
              const monthsLeft = Math.max(
                1,
                Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) / 
                  (30 * 24 * 60 * 60 * 1000)
                )
              );
              const monthlySavingsNeeded = monthsLeft > 0 
                ? (goal.target_amount - goal.saved_amount) / monthsLeft 
                : 0;

              return (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{goal.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[goal.priority]}`}>
                          {priorityLabels[goal.priority]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {t('due')} {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 text-right">
                      <div className="text-sm font-medium">{goal.saved_amount} / {goal.target_amount} MAD</div>
                      <div className="text-xs text-gray-500">
                        {t('save')} {monthlySavingsNeeded.toFixed(2)} MAD/{t('month')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{progress}% {t('complete')}</span>
                      <span className="text-xs text-gray-500">{monthsLeft} {t('monthsLeft')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">{t('noSavingsGoals')}</p>
            <Button variant="outline" size="sm" onClick={() => 
              document.getElementById('add-goal-button')?.click()
            }>
              {t('addGoal')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
