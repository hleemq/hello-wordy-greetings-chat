
import React from 'react';
import { 
  Wallet, 
  Split, 
  Landmark, 
  Target, 
  Calendar, 
  Plus, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map our custom icon names to lucide icons
const iconMap = {
  'wallet': Wallet,
  'split-bill': Split,
  'savings': Landmark,
  'target': Target,
  'calendar': Calendar,
  'add': Plus,
  'check': Check,
  'sync': RefreshCw,
};

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  filled?: boolean;
  color?: string;
}

export const Icon = ({ 
  name, 
  size = 24, 
  className, 
  filled = false,
  color
}: IconProps) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.error(`Icon "${name}" does not exist in our icon set`);
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      className={cn(
        'stroke-2 rounded-full',
        filled ? 'fill-sunshine' : '',
        className
      )}
      strokeLinecap="round"
      color={color}
    />
  );
};
