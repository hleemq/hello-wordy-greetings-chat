
import React, { useEffect, useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Globe, UserRound } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { state, dispatch } = useFinance();
  const { user, signOut } = useAuth();
  const { profile, getDisplayNames } = useProfile();
  const { currentView, activeProfile } = state;
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [displayNames, setDisplayNames] = useState(() => getDisplayNames());

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      setDisplayNames(getDisplayNames());
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [getDisplayNames]);

  // Update display names when profile changes
  useEffect(() => {
    setDisplayNames(getDisplayNames());
  }, [profile, getDisplayNames]);

  const switchProfile = () => {
    dispatch({ 
      type: 'SWITCH_PROFILE', 
      payload: activeProfile === 'Hasnaa' ? 'Achraf' : 'Hasnaa' 
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const currentDisplayName = activeProfile === 'Hasnaa' ? displayNames.hasnaaName : displayNames.achrafName;

  const navItems = [
    { id: 'dashboard', label: t('dashboard') },
    { id: 'expenses', label: t('expenses') },
    { id: 'goals', label: t('goals') },
    { id: 'reports', label: t('reports') },
    { id: 'consultant', label: '💼 Consultant' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-midnight text-cloud shadow-sm border-b border-mindaro/20">
      <div className="w-full max-w-none px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <Logo showTagline />
            </div>
            <nav className="hidden lg:ml-8 lg:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: 'CHANGE_VIEW', payload: item.id as any })}
                  className={`px-3 py-2 rounded-md text-sm font-franklin-medium transition-colors ${
                    currentView === item.id
                      ? 'text-sunshine bg-sunshine/10'
                      : 'text-cloud hover:text-mindaro hover:bg-mindaro/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <DarkModeToggle />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchProfile}
                    className="hidden sm:flex items-center gap-2 border-mindaro/30 bg-transparent text-cloud hover:bg-mindaro/10 text-xs"
                  >
                    {activeProfile === 'Hasnaa' ? (
                      <UserRound className="h-4 w-4" style={{ color: '#FFDEE2' }} />
                    ) : (
                      <UserRound className="h-4 w-4" style={{ color: '#1EAEDB' }} />
                    )}
                    <span className="hidden md:inline">
                      {language === 'ar' ? 'نشط' : t('active')}: {currentDisplayName}
                    </span>
                    <span className="md:hidden">
                      {currentDisplayName}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch between {displayNames.hasnaaName} and {displayNames.achrafName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleLanguage} className="text-cloud hover:bg-mindaro/10 h-8 w-8">
                    <Globe className="h-4 w-4" />
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
                  <Button variant="ghost" size="icon" onClick={handleProfileClick} className="text-cloud hover:bg-mindaro/10 p-0 h-8 w-8">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="text-xs bg-mindaro text-midnight">
                        {(profile?.first_name?.[0] || 'H')}{(profile?.partner_first_name?.[0] || 'A')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Profile Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={handleLogout} 
                    className="bg-error/20 text-error hover:bg-error hover:text-white border border-error/30 h-8 w-8"
                  >
                    <LogOut className="h-4 w-4" />
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
      <div className="lg:hidden border-t border-mindaro/20">
        <div className="grid grid-cols-5 divide-x divide-mindaro/20">
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
    </nav>
  );
};

export default Navigation;
