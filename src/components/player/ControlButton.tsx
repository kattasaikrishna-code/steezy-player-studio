import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export const ControlButton: React.FC<ControlButtonProps> = ({
  icon,
  label,
  onClick,
  active = false,
  disabled = false,
  size = 'default',
}) => {
  const sizeMap = {
    sm: 'iconSm' as const,
    default: 'icon' as const,
    lg: 'iconLg' as const,
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? 'controlActive' : 'control'}
          size={sizeMap[size]}
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'transition-all duration-200',
            active && 'animate-pulse-glow'
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-card border-border">
        <p className="text-sm font-medium">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
