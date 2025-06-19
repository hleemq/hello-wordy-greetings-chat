
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
    const { message, userData } = await req.json();
    
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

    // Fetch user's financial data
    const [expensesResult, goalsResult] = await Promise.all([
      supabaseClient.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(50),
      supabaseClient.from('goals').select('*').eq('user_id', user.id).order('deadline', { ascending: true })
    ]);

    const expenses = expensesResult.data || [];
    const goals = goalsResult.data || [];

    // Calculate financial insights
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    });
    const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Category analysis
    const categorySpending = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Goal progress analysis
    const goalAnalysis = goals.map(goal => ({
      name: goal.name,
      progress: (goal.saved_amount / goal.target_amount) * 100,
      remaining: goal.target_amount - goal.saved_amount,
      deadline: goal.deadline,
      monthsLeft: Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))
    }));

    // Create comprehensive financial context
    const financialContext = `
Financial Data Analysis:
- Total expenses: ${totalExpenses.toFixed(2)} MAD
- Monthly expenses: ${monthlyTotal.toFixed(2)} MAD
- Category breakdown: ${JSON.stringify(categorySpending)}
- Goals: ${JSON.stringify(goalAnalysis)}
- Recent expenses: ${JSON.stringify(monthlyExpenses.slice(0, 10))}

User Question: ${message}
`;

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCexW8RU1ufTLDA2mjRr1b-bkPBcxMCE9A`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a professional financial consultant named "The Consultant" for a Moroccan finance app. Analyze the user's financial data and provide personalized advice. 

Guidelines:
- Be professional yet conversational
- Provide specific, actionable insights
- Use MAD currency
- Detect spending anomalies and patterns
- Give realistic timeline predictions for goals
- Suggest practical budget adjustments
- Respond in both English and Arabic when appropriate
- Focus on achievable recommendations

${financialContext}

Provide detailed financial advice based on this data.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response from AI');
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    // Store conversation in database for future reference
    await supabaseClient.from('consultant_conversations').insert({
      user_id: user.id,
      user_message: message,
      ai_response: aiResponse,
      financial_context: financialContext
    });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      insights: {
        monthlySpending: monthlyTotal,
        topCategory: Object.entries(categorySpending).sort(([,a], [,b]) => b - a)[0],
        goalProgress: goalAnalysis
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
