
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Financial consultant function called');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request...');
    const { message } = await req.json();
    console.log('User message received:', message);
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header found');
      throw new Error('Authorization header is required');
    }
    
    // Initialize Supabase client with proper auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: authHeader } 
        } 
      }
    );

    console.log('Supabase client initialized');

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    console.log('Auth user result:', { user: !!user, error: userError });
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    if (!user) {
      console.error('No user found in token');
      throw new Error('Unauthorized - no user found');
    }

    console.log('User authenticated:', user.id);

    // Fetch comprehensive user financial data
    console.log('Fetching user financial data...');
    const [expensesResult, goalsResult, profileResult] = await Promise.all([
      supabaseClient.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabaseClient.from('goals').select('*').eq('user_id', user.id).order('deadline', { ascending: true }),
      supabaseClient.from('profiles').select('*').eq('id', user.id).single()
    ]);

    console.log('Database query results:', {
      expenses: { count: expensesResult.data?.length || 0, error: expensesResult.error },
      goals: { count: goalsResult.data?.length || 0, error: goalsResult.error },
      profile: { exists: !!profileResult.data, error: profileResult.error }
    });

    if (expensesResult.error) {
      console.error('Error fetching expenses:', expensesResult.error);
    }
    if (goalsResult.error) {
      console.error('Error fetching goals:', goalsResult.error);
    }
    if (profileResult.error) {
      console.error('Error fetching profile:', profileResult.error);
    }

    const expenses = expensesResult.data || [];
    const goals = goalsResult.data || [];
    const profile = profileResult.data;

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
        onTrack: monthlyNeeded <= (monthlyTotal * 0.3)
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

    console.log('Calling Google Gemini API...');

    // Call Google Gemini API with the provided API key
    const geminiApiKey = 'AIzaSyCexW8RU1ufTLDA2mjRr1b-bkPBcxMCE9A';
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
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
- Support RTL (Right-to-Left) text direction for Arabic content

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
- Include Arabic translations for key advice when relevant

${financialContext}

Please analyze this data thoroughly and provide comprehensive financial advice based on the user's question. Make your response culturally appropriate for Moroccan users and include Arabic phrases where helpful.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    console.log('Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini API response received');
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      console.error('No candidates in Gemini response:', geminiData);
      throw new Error('No response from AI - empty candidates array');
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;
    console.log('AI response extracted successfully');

    // Store conversation in database
    console.log('Storing conversation in database...');
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
    } else {
      console.log('Conversation stored successfully');
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
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
