
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";
import { exportDataToJson, triggerDownload } from '@/utils/offlineStorage';

const DataExport: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Export data and trigger download
      const jsonData = await exportDataToJson();
      triggerDownload(
        jsonData, 
        `we-finance-export-${new Date().toISOString().slice(0, 10)}.json`
      );
      
      toast({
        title: t('exportSuccessful'),
        description: t('dataExportedSuccessfully'),
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: t('exportFailed'),
        description: t('errorExportingData'),
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-3">
        <CardTitle>{t('dataBackup')}</CardTitle>
        <CardDescription>
          {t('exportDataDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleExport} 
          disabled={exporting}
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? t('exporting') : t('exportData')}
        </Button>
        <p className="text-sm text-muted-foreground mt-3">
          {t('exportDataNote')}
        </p>
      </CardContent>
    </Card>
  );
};

export default DataExport;
