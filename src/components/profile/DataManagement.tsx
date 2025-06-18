
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportDataToJson, triggerDownload, importDataFromJson } from '@/utils/offlineStorage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const DataManagement = () => {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const exportData = async () => {
    try {
      const data = await exportDataToJson();
      const filename = `we-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
      triggerDownload(data, filename);
      
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return;

    setImporting(true);
    try {
      const file = event.target.files[0];
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the data structure
      if (!data.expenses && !data.goals && !data.profile) {
        throw new Error('Invalid backup file format');
      }

      // Import expenses
      if (data.expenses && Array.isArray(data.expenses)) {
        for (const expense of data.expenses) {
          await supabase.from('expenses').insert({
            ...expense,
            id: undefined, // Let the database generate new IDs
            user_id: user.id,
            created_at: undefined
          });
        }
      }

      // Import goals
      if (data.goals && Array.isArray(data.goals)) {
        for (const goal of data.goals) {
          await supabase.from('goals').insert({
            ...goal,
            id: undefined, // Let the database generate new IDs
            user_id: user.id,
            created_at: undefined
          });
        }
      }

      // Import profile data
      if (data.profile) {
        await supabase.from('profiles').upsert({
          id: user.id,
          first_name: data.profile.first_name,
          last_name: data.profile.last_name,
          partner_first_name: data.profile.partner_first_name,
          partner_last_name: data.profile.partner_last_name,
          updated_at: new Date().toISOString()
        });
      }

      toast({
        title: "Success",
        description: "Data imported successfully. Please refresh the page to see the changes.",
      });

      // Clear the input
      event.target.value = '';
    } catch (error: any) {
      console.error('Error importing data:', error);
      toast({
        title: "Error",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="border-mindaro/30 bg-cloud/50 dark:bg-midnight/90">
      <CardHeader>
        <CardTitle className="font-franklin-heavy text-midnight dark:text-cloud">Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Button onClick={exportData} variant="outline" className="space-x-2 border-mindaro/50 hover:bg-mindaro/20">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
          <p className="text-sm text-muted-foreground">
            Download all your expenses, goals, and profile data as a JSON file.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="data-import" className="cursor-pointer">
            <Button variant="outline" className="space-x-2 border-mindaro/50 hover:bg-mindaro/20" disabled={importing}>
              <Upload className="h-4 w-4" />
              <span>{importing ? 'Importing...' : 'Import Data'}</span>
            </Button>
          </Label>
          <Input
            id="data-import"
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground">
            Import data from a previously exported JSON file. This will add to your existing data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagement;
