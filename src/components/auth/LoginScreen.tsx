import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';
const LoginScreen = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const {
    dispatch
  } = useFinance();
  const handleLogin = () => {
    if (pin === '2024') {
      dispatch({
        type: 'LOGIN'
      });
    } else {
      setError('Invalid PIN. Try "2024"');
      setTimeout(() => setError(''), 3000);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="w-full max-w-md p-8 space-y-8 shadow-md rounded-3xl bg-slate-950">
        <div className="text-center">
          <h1 className="text-3xl text-[#fefe00] font-extrabold text-center">WE</h1>
          <p className="mt-2 text-base text-zinc-100">Grow Together</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 rounded-none bg-slate-950">
              Enter PIN 
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="ml-1">
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-sm">Use PIN "2024" to log in</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input type="password" placeholder="Enter PIN" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => {
            if (e.key === 'Enter') handleLogin();
          }} className="w-full py-2 px-3" />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </div>
      </div>
    </div>;
};
export default LoginScreen;