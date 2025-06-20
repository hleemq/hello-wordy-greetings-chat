
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user from token
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Fetch comprehensive user financial data
    const [expensesResult, goalsResult, profileResult] = await Promise.all([
      supabaseClient.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabaseClient.from('goals').select('*').eq('user_id', user.id).order('deadline', { ascending: true }),
      supabaseClient.from('profiles').select('*').eq('id', user.id).single()
    ]);

    const expenses = expensesResult.data || [];
    const goals = goalsResult.data || [];
    const profile = profileResult.data;

    console.log(`Processing request for user ${user.id}`);
    console.log(`Found ${expenses.length} expenses and ${goals.length} goals`);

    // Calculate comprehensive financial insights
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Monthly analysis
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Last 3 months analysis
    const last3MonthsExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const monthsAgo = (currentYear - expDate.getFullYear()) * 12 + (currentMonth - expDate.getMonth());
      return monthsAgo >= 0 && monthsAgo < 3;
    });

    // Category analysis
    const categorySpending = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryAnalysis = Object.entries(categorySpending)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    // Weekly spending pattern
    const weeklySpending = expenses.reduce((acc, exp) => {
      const expDate = new Date(exp.date);
      const dayOfWeek = expDate.getDay();
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + exp.amount;
      return acc;
    }, {} as Record<number, number>);

    // Goal progress analysis
    const goalAnalysis = goals.map(goal => {
      const progress = (goal.saved_amount / goal.target_amount) * 100;
      const remaining = goal.target_amount - goal.saved_amount;
      const deadline = new Date(goal.deadline);
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const monthsLeft = Math.ceil(daysLeft / 30);
      const monthlyNeeded = monthsLeft > 0 ? remaining / monthsLeft : remaining;
      
      return {
        name: goal.name,
        progress: Math.round(progress),
        remaining,
        daysLeft,
        monthsLeft,
        monthlyNeeded,
        priority: goal.priority,
        onTrack: monthlyNeeded <= (monthlyTotal * 0.3) // Can save 30% of monthly spending
      };
    });

    // Spending trends
    const avgMonthlySpending = last3MonthsExpenses.reduce((sum, exp) => sum + exp.amount, 0) / 3;
    const spendingTrend = monthlyTotal > avgMonthlySpending ? 'increasing' : 'decreasing';
    const trendPercentage = Math.abs(((monthlyTotal - avgMonthlySpending) / avgMonthlySpending) * 100);

    // Anomaly detection
    const avgExpenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length;
    const largeExpenses = monthlyExpenses.filter(exp => exp.amount > avgExpenseAmount * 2);

    // Create comprehensive financial context
    const financialContext = `
COMPREHENSIVE FINANCIAL PROFILE:

USER INFO:
- Name: ${profile?.first_name || ''} ${profile?.last_name || ''}
- Partner: ${profile?.partner_first_name || ''} ${profile?.partner_last_name || ''}

CURRENT FINANCIAL STATUS:
- Total lifetime expenses: ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)} MAD
- Current month expenses: ${monthlyTotal.toFixed(2)} MAD
- Average monthly spending (last 3 months): ${avgMonthlySpending.toFixed(2)} MAD
- Spending trend: ${spendingTrend} by ${trendPercentage.toFixed(1)}%

CATEGORY BREAKDOWN (Top 5):
${categoryAnalysis.map(([cat, amount]) => `- ${cat}: ${amount.toFixed(2)} MAD`).join('\n')}

WEEKLY SPENDING PATTERN:
${Object.entries(weeklySpending).map(([day, amount]) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `- ${dayNames[parseInt(day)]}: ${amount.toFixed(2)} MAD`;
}).join('\n')}

GOALS ANALYSIS:
${goalAnalysis.map(goal => `
- ${goal.name} (${goal.priority} priority):
  * Progress: ${goal.progress}%
  * Remaining: ${goal.remaining.toFixed(2)} MAD
  * Days left: ${goal.daysLeft}
  * Monthly savings needed: ${goal.monthlyNeeded.toFixed(2)} MAD
  * On track: ${goal.onTrack ? 'Yes' : 'No'}
`).join('')}

RECENT LARGE EXPENSES:
${largeExpenses.map(exp => `- ${exp.category}: ${exp.amount.toFixed(2)} MAD on ${new Date(exp.date).toLocaleDateString()} (${exp.notes || 'No notes'})`).join('\n')}

RECENT TRANSACTIONS (Last 10):
${monthlyExpenses.slice(0, 10).map(exp => `- ${new Date(exp.date).toLocaleDateString()}: ${exp.amount.toFixed(2)} MAD (${exp.category}) - Paid by ${exp.paid_by}`).join('\n')}

USER QUESTION: ${message}
`;

    console.log('Calling Gemini API...');

    // Call Gemini API with comprehensive context
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are "The Consultant" - a professional financial advisor for a Moroccan finance app. You have access to comprehensive financial data and must provide personalized, actionable advice.

PERSONALITY & STYLE:
- Professional yet conversational and friendly
- Use specific numbers and data from the user's actual financial information
- Provide concrete, actionable recommendations
- Be encouraging but realistic
- Respond in both English and Arabic when appropriate
- Use MAD currency consistently

ANALYSIS CAPABILITIES:
- Detect spending patterns and anomalies
- Provide realistic timeline predictions for goals
- Suggest specific budget adjustments based on actual data
- Identify opportunities for savings
- Alert about unusual spending behavior
- Compare current spending with historical patterns

RESPONSE FORMAT:
- Start with a brief summary of their current financial situation
- Address their specific question with data-backed insights
- Provide 2-3 specific actionable recommendations
- End with encouragement and next steps

${financialContext}

Please analyze this data thoroughly and provide comprehensive financial advice based on the user's question.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response from AI');
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    // Store conversation in database
    const { error: insertError } = await supabaseClient.from('consultant_conversations').insert({
      user_id: user.id,
      user_message: message,
      ai_response: aiResponse,
      financial_context: JSON.stringify({
        monthlySpending: monthlyTotal,
        categoryBreakdown: categoryAnalysis,
        goalProgress: goalAnalysis,
        spendingTrend: { trend: spendingTrend, percentage: trendPercentage }
      })
    });

    if (insertError) {
      console.error('Error storing conversation:', insertError);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      insights: {
        monthlySpending: monthlyTotal,
        topCategory: categoryAnalysis[0],
        goalProgress: goalAnalysis,
        spendingTrend: spendingTrend,
        anomalies: largeExpenses.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in financial-consultant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
