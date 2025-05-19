
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LogOut, HelpCircle } from 'lucide-react';

const Navigation = () => {
  const { state, dispatch } = useFinance();
  const { currentView, activeProfile } = state;

  const switchProfile = () => {
    dispatch({ 
      type: 'SWITCH_PROFILE', 
      payload: activeProfile === 'Hasnaa' ? 'Achraf' : 'Hasnaa' 
    });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'goals', label: 'Goals' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-lg font-bold">Finance Tracker</span>
            </div>
            <nav className="hidden md:ml-6 md:flex space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: item.id as any })}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === item.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={switchProfile}
                    className="relative"
                  >
                    <span>Active: {activeProfile}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch between profiles</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Log out</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t">
        <div className="grid grid-cols-4 divide-x">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: item.id as any })}
              className={`py-3 text-xs font-medium ${
                currentView === item.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
