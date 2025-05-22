
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const NetworkStatus: React.FC = () => {
  const { state } = useFinance();
  const { t } = useLanguage();
  const { isOnline } = state;

  // Only show when offline
  if (isOnline) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full z-50",
      "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100",
      "text-xs animate-pulse"
    )}>
      <WifiOff className="h-3 w-3" />
      <span>{t('youAreOffline')}</span>
    </div>
  );
};

export default NetworkStatus;
