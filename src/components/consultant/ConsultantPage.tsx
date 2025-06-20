
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, TrendingUp, AlertTriangle, Target, Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  insights?: {
    monthlySpending: number;
    topCategory: [string, number];
    goalProgress: any[];
  };
}

interface ConversationRecord {
  id: string;
  user_id: string;
  user_message: string;
  ai_response: string;
  financial_context: string | null;
  created_at: string;
}

const ConsultantPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickInsights, setQuickInsights] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation history
    loadConversationHistory();
    // Generate initial insights
    generateQuickInsights();
  }, [user]);

  const loadConversationHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('consultant_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(10) as { data: ConversationRecord[] | null; error: any };

      if (error) throw error;

      const conversationMessages: Message[] = [];
      data?.forEach((conv, index) => {
        conversationMessages.push({
          id: `user-${index}`,
          type: 'user',
          content: conv.user_message,
          timestamp: new Date(conv.created_at)
        });
        conversationMessages.push({
          id: `ai-${index}`,
          type: 'ai',
          content: conv.ai_response,
          timestamp: new Date(conv.created_at)
        });
      });

      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const generateQuickInsights = async () => {
    if (!user) return;

    try {
      const [expensesResult, goalsResult] = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
        supabase.from('goals').select('*').eq('user_id', user.id)
      ]);

      const expenses = expensesResult.data || [];
      const goals = goalsResult.data || [];

      // Calculate quick insights
      const monthlyExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const now = new Date();
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      });

      const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      const categorySpending = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>);

      const topCategory = Object.entries(categorySpending).sort(([,a], [,b]) => (b as number) - (a as number))[0];

      setQuickInsights({
        monthlySpending: monthlyTotal,
        topCategory,
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.saved_amount < g.target_amount).length
      });
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to consultant function...');
      const { data, error } = await supabase.functions.invoke('financial-consultant', {
        body: { message: inputMessage }
      });

      console.log('Response from consultant function:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        insights: data.insights
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ / Error",
        description: `Failed to get response from consultant: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = language === 'ar' ? [
    "كيف يمكنني تقليل مصاريفي الشهرية؟",
    "متى سأحقق أهداف الادخار؟",
    "ما هي أكبر فئة إنفاق لدي؟",
    "هل هناك أنماط إنفاق غير عادية؟",
    "كيف يمكنني تحسين وضعي المالي؟"
  ] : [
    "How can I reduce my monthly expenses?",
    "When will I reach my savings goals?",
    "What's my biggest spending category?",
    "Are there any unusual spending patterns?",
    "How can I improve my financial situation?"
  ];

  const isRTL = language === 'ar';

  return (
    <div className={`container mx-auto px-4 py-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-franklin-heavy text-midnight mb-2">
            {language === 'ar' ? '💼 المستشار المالي' : '💼 The Consultant'}
          </h1>
          <p className="text-gray-600 font-franklin-book">
            {language === 'ar' 
              ? 'مستشارك المالي الذكي الذي يحلل بياناتك في الوقت الفعلي'
              : 'Your AI-powered financial advisor analyzing your data in real-time'
            }
          </p>
        </div>

        {/* Quick Insights Cards */}
        {quickInsights && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-sunshine/10">
              <CardContent className="p-4">
                <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <TrendingUp className="h-5 w-5 text-sunshine" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? 'الإنفاق الشهري' : 'Monthly Spending'}
                    </p>
                    <p className="font-franklin-heavy text-lg">{quickInsights.monthlySpending?.toFixed(2)} MAD</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-mindaro/10">
              <CardContent className="p-4">
                <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <AlertTriangle className="h-5 w-5 text-mindaro" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? 'الفئة الأعلى' : 'Top Category'}
                    </p>
                    <p className="font-franklin-heavy text-lg">{quickInsights.topCategory?.[0] || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cloud/10">
              <CardContent className="p-4">
                <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <Target className="h-5 w-5 text-midnight" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? 'الأهداف النشطة' : 'Active Goals'}
                    </p>
                    <p className="font-franklin-heavy text-lg">{quickInsights.activeGoals}/{quickInsights.totalGoals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-success/10">
              <CardContent className="p-4">
                <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <MessageCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'ar' ? 'الاستشارات' : 'Consultations'}
                    </p>
                    <p className="font-franklin-heavy text-lg">{Math.floor(messages.length / 2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chat Interface */}
        <Card className="h-96 flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="font-franklin-heavy">
              {language === 'ar' ? 'الاستشارة المالية' : 'Financial Consultation'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-64">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-franklin-book">
                    {language === 'ar' 
                      ? 'اسألني أي شيء حول أموالك!'
                      : 'Ask me anything about your finances!'
                    }
                  </p>
                  <p className="text-sm mt-2">
                    {language === 'ar' 
                      ? 'أنا هنا لمساعدتك!'
                      : 'I\'m here to help!'
                    }
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' 
                      ? (isRTL ? 'justify-start' : 'justify-end')
                      : (isRTL ? 'justify-end' : 'justify-start')
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-sunshine text-midnight'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="font-franklin-book text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2 font-franklin-medium">
                  {language === 'ar' ? 'أسئلة سريعة:' : 'Quick questions:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.slice(0, 3).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(question)}
                      className="text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'ar' 
                  ? "اسأل عن أموالك..."
                  : "Ask about your finances..."
                }
                className="flex-1 font-franklin-book"
                disabled={isLoading}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !inputMessage.trim()}
                className="bg-sunshine hover:bg-sunshine/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-sunshine" />
            <h3 className="font-franklin-heavy text-midnight">
              {language === 'ar' ? 'تحليل ذكي' : 'Smart Analysis'}
            </h3>
            <p className="text-sm text-gray-600 font-franklin-book">
              {language === 'ar' 
                ? 'رؤى في الوقت الفعلي من بياناتك المالية'
                : 'Real-time insights from your financial data'
              }
            </p>
          </div>
          <div className="p-4">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-error" />
            <h3 className="font-franklin-heavy text-midnight">
              {language === 'ar' ? 'كشف الشذوذ' : 'Anomaly Detection'}
            </h3>
            <p className="text-sm text-gray-600 font-franklin-book">
              {language === 'ar' 
                ? 'تنبيهات لأنماط الإنفاق غير العادية'
                : 'Alerts for unusual spending patterns'
              }
            </p>
          </div>
          <div className="p-4">
            <Target className="h-8 w-8 mx-auto mb-2 text-success" />
            <h3 className="font-franklin-heavy text-midnight">
              {language === 'ar' ? 'توقعات الأهداف' : 'Goal Predictions'}
            </h3>
            <p className="text-sm text-gray-600 font-franklin-book">
              {language === 'ar' 
                ? 'توقعات الجدول الزمني لأهداف ادخارك'
                : 'Timeline forecasts for your savings goals'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantPage;
