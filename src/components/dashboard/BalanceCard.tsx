
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle } from 'lucide-react';

interface BalanceCardProps {
  hasnaaPaid: number;
  achrafPaid: number;
  displayNames: {
    hasnaaName: string;
    achrafName: string;
  };
}

export const BalanceCard = ({ hasnaaPaid, achrafPaid, displayNames }: BalanceCardProps) => {
  const { t } = useLanguage();
  
  const difference = Math.abs(hasnaaPaid - achrafPaid);
  const whoOwes = hasnaaPaid > achrafPaid ? 'Achraf' : hasnaaPaid < achrafPaid ? 'Hasnaa' : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('balanceSummary')}</CardTitle>
          <CardDescription>{t('currentBalance')}</CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-80">
              <p>{t('balanceTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded p-4 text-center">
              <div className="text-sm text-gray-500">{displayNames.hasnaaName} Paid</div>
              <div className="text-xl font-semibold">{hasnaaPaid.toFixed(2)} MAD</div>
            </div>
            <div className="border rounded p-4 text-center">
              <div className="text-sm text-gray-500">{displayNames.achrafName} Paid</div>
              <div className="text-xl font-semibold">{achrafPaid.toFixed(2)} MAD</div>
            </div>
          </div>

          <div className="border-t pt-4">
            {whoOwes ? (
              <div className="text-center p-3 bg-gray-50 rounded-md">
                <span className="font-medium">
                  {whoOwes === 'Hasnaa' ? displayNames.hasnaaName : displayNames.achrafName}
                </span> {t('owes')}{' '}
                <span className="font-medium">
                  {whoOwes === 'Hasnaa' ? displayNames.achrafName : displayNames.hasnaaName}
                </span>{' '}
                <span className="text-lg font-semibold">{difference.toFixed(2)} MAD</span>
              </div>
            ) : (
              <div className="text-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-600">{t('balancedExpenses')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
