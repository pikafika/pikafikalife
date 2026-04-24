import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  helperText, 
  error,
  className,
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[13px] font-bold text-text-sub ml-0.5">
          {label}
        </label>
      )}
      <input
        className={twMerge(
          'w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-sm font-medium text-text-main transition-all text-[15px] outline-none',
          'focus:bg-white focus:border-brand-500',
          error ? 'border-red-500 bg-red-50 focus:border-red-500' : '',
          className
        )}
        {...props}
      />
      {helperText && (
        <span className={twMerge(
          'text-[11px] font-medium ml-1',
          error ? 'text-red-500' : 'text-text-muted'
        )}>
          {helperText}
        </span>
      )}
    </div>
  );
};
