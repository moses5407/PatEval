import React, { forwardRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../lib/utils';

interface DateFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  label: string;
  name: string;
  error?: string;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  standalone?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(({ 
  label,
  name,
  error,
  className,
  labelClassName,
  required,
  standalone,
  value: controlledValue,
  onValueChange,
  onChange,
  ...props
}, ref) => {
  const formContext = useFormContext();

  // Handle both controlled (standalone) and form-controlled inputs
  if (standalone || !formContext) {
    return (
      <div className="mb-4">
        <label className={cn("block text-sm font-medium text-gray-700 mb-1", labelClassName)}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="date"
            className={cn(
              "block w-full rounded-md border-gray-300 shadow-sm",
              "focus:border-blue-500 focus:ring-blue-500",
              error && "border-red-500",
              className
            )}
            value={controlledValue}
            onChange={(e) => {
              onValueChange?.(e.target.value);
              onChange?.(e);
            }}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // Form-controlled version
  const { register } = formContext;
  const { ref: registerRef, ...registerProps } = register(name);

  return (
    <div className="mb-4">
      <label className={cn("block text-sm font-medium text-gray-700 mb-1", labelClassName)}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="date"
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-blue-500 focus:ring-blue-500",
            error && "border-red-500",
            className
          )}
          {...registerProps}
          {...props}
          ref={(element) => {
            registerRef(element);
            if (typeof ref === 'function') {
              ref(element);
            } else if (ref) {
              ref.current = element;
            }
          }}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

DateField.displayName = 'DateField';