
import { supabase } from '@/integrations/supabase/client';

export const exportDataToJson = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Fetch all user data
    const [expensesResult, goalsResult, profileResult] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      expenses: expensesResult.data || [],
      goals: goalsResult.data || [],
      profile: profileResult.data || null
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const triggerDownload = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importDataFromJson = async (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    return data;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Invalid JSON format');
  }
};
