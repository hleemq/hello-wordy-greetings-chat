
import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { state } = useFinance();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if we should show the install prompt (after 30 seconds or first expense)
    const hasExpenses = state.expenses && state.expenses.length > 0;
    
    // Set a timer for 30 seconds
    const timer = setTimeout(() => {
      if (deferredPrompt) {
        setShowPrompt(true);
      }
    }, 30000);

    // If user adds first expense, show prompt
    if (hasExpenses && deferredPrompt) {
      setShowPrompt(true);
      clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [state.expenses, deferredPrompt]);

  const handleInstallClick = () => {
    if (!deferredPrompt) {
      toast({
        title: "Installation unavailable",
        description: "Your browser doesn't support PWA installation or the app is already installed.",
        variant: "destructive",
      });
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        toast({
          title: "Thank you!",
          description: "WE Finance has been added to your home screen.",
        });
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-midnight text-cloud z-50 flex items-center justify-between">
      <div>
        <h3 className="font-franklin-medium text-sm">Add WE to your home screen</h3>
        <p className="text-xs opacity-80">Track your expenses offline anytime!</p>
      </div>
      <div className="flex space-x-2">
        <Button 
          onClick={() => setShowPrompt(false)} 
          variant="outline" 
          className="text-xs"
        >
          Not now
        </Button>
        <Button 
          onClick={handleInstallClick} 
          className="bg-sunshine text-midnight text-xs"
        >
          Install
        </Button>
      </div>
    </div>
  );
};

export default InstallPrompt;
