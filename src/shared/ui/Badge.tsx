import type { HTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  customColor?: string;
}

export const Badge = ({ 
  children, 
  variant = 'default', 
  customColor,
  className, 
  style,
  ...props 
}: BadgeProps) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };
  
  const customStyles = customColor 
    ? { 
        backgroundColor: `${customColor}20`, // 20% opacity
        color: customColor,
        ...style 
      } 
    : style;
  
  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        customColor ? '' : variants[variant],
        className
      )}
      style={customStyles}
      {...props}
    >
      {children}
    </span>
  );
}; 