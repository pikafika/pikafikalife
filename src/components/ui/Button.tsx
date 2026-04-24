import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className,
  ...props 
}) => {
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
    secondary: 'bg-brand-50 text-brand-600 hover:bg-brand-100 active:bg-brand-200',
    outline: 'bg-white border border-gray-200 text-text-main hover:bg-gray-50 active:bg-gray-100',
    ghost: 'bg-transparent text-text-sub hover:bg-gray-100 active:bg-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-2 text-[12px]',
    md: 'px-5 py-3.5 text-[14px]',
    lg: 'px-6 py-4.5 text-[16px]',
  };

  return (
    <button
      className={twMerge(
        'inline-flex items-center justify-center rounded-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
