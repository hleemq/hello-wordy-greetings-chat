
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataExport from '@/components/settings/DataExport';

const Settings: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="container px-4 py-8 mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">{t('settings')}</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('dataManagement')}</h2>
        <DataExport />
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('performance')}</h2>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t('loadingPerformance')}</CardTitle>
            <CardDescription>
              {t('optimizedForFastLoading')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('assetCaching')}</span>
                <span className="text-sm text-green-600 dark:text-green-400">{t('enabled')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('offlineSupport')}</span>
                <span className="text-sm text-green-600 dark:text-green-400">{t('enabled')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('dataSync')}</span>
                <span className="text-sm text-green-600 dark:text-green-400">{t('automatic')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Settings;
