import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  padding = 'md'
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={twMerge(
      'bg-white border border-gray-100 rounded-lg shadow-lds overflow-hidden',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
};
