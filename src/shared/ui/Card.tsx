import type { HTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  compact?: boolean;
}

export const Card = ({ children, compact = false, className, ...props }: CardProps) => {
  return (
    <div
      className={twMerge(
        'card',
        compact ? 'p-4' : 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}; 