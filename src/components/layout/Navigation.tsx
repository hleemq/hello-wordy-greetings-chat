
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LogOut, Globe, UserRound } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const Navigation = () => {
  const { state, dispatch } = useFinance();
  const { currentView, activeProfile } = state;
  const { language, setLanguage, t } = useLanguage();

  const switchProfile = () => {
    dispatch({ 
      type: 'SWITCH_PROFILE', 
      payload: activeProfile === 'Hasnaa' ? 'Achraf' : 'Hasnaa' 
    });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard') },
    { id: 'expenses', label: t('expenses') },
    { id: 'goals', label: t('goals') },
    { id: 'reports', label: t('reports') },
  ];

  return (
    <div className="bg-midnight text-cloud shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-3">
              <Logo showTagline />
            </div>
            <nav className="hidden md:ml-6 md:flex space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: item.id as any })}
                  className={`px-3 py-2 rounded-md text-sm font-franklin-medium relative ${
                    currentView === item.id
                      ? 'text-sunshine'
                      : 'text-cloud hover:text-mindaro'
                  } ${currentView === item.id ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-sunshine' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={switchProfile}
                    className="relative flex items-center gap-2 border-mindaro/30 bg-transparent text-cloud hover:bg-mindaro/10"
                  >
                    {activeProfile === 'Hasnaa' ? (
                      <UserRound className="h-5 w-5" style={{ color: '#FFDEE2' }} />
                    ) : (
                      <UserRound className="h-5 w-5" style={{ color: '#1EAEDB' }} />
                    )}
                    <span>{t('active')}: {activeProfile}</span>
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
                  <Button variant="ghost" size="icon" onClick={toggleLanguage} className="text-cloud hover:bg-mindaro/10">
                    <Globe className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('language')}: {language === 'en' ? 'English' : 'العربية'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-cloud hover:bg-mindaro/10">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('logout')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-mindaro/20">
        <div className="grid grid-cols-4 divide-x divide-mindaro/20">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: item.id as any })}
              className={`py-3 text-xs font-franklin-medium ${
                currentView === item.id
                  ? 'text-sunshine border-t-2 border-t-sunshine'
                  : 'text-cloud'
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
