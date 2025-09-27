import React, { forwardRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type?: string;
  className?: string;
  labelClassName?: string;
  error?: string;
  standalone?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  label,
  name,
  type = 'text',
  className = '',
  labelClassName = '',
  error,
  standalone = false,
  onChange: externalOnChange,
  onBlur: externalOnBlur,
  ...props
}, ref) => {
  const context = useFormContext();
  const register = context?.register;

  // If standalone or no form context, use regular input behavior
  if (standalone || !register) {
    return (
      <div className="mb-4">
        <label 
          htmlFor={name}
          className={cn(
            "block text-sm font-medium text-gray-700 mb-1",
            labelClassName
          )}
        >
          {label}
        </label>
        <input
          id={name}
          type={type}
          className={cn(
            "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
            "focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50",
            error && "border-red-500",
            className
          )}
          onChange={externalOnChange}
          onBlur={externalOnBlur}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // Form context is available, use react-hook-form registration
  const { ref: registerRef, ...registerRest } = register(name, {
    valueAsNumber: type === 'number',
    setValueAs: type === 'number' ? (value) => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    } : undefined
  });

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'date') {
      const input = e.target.value.replace(/\D/g, '');
      if (input.length === 8) {
        const year = input.slice(0, 4);
        const month = input.slice(4, 6);
        const day = input.slice(6, 8);
        const formattedDate = `${year}-${month}-${day}`;
        const dateObj = new Date(formattedDate);
        if (!isNaN(dateObj.getTime())) {
          e.target.value = formattedDate;
          const event = new Event('input', { bubbles: true });
          e.target.dispatchEvent(event);
        }
      } else if (input === '') {
        e.target.value = '';
        const event = new Event('input', { bubbles: true });
        e.target.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="mb-4">
      <label 
        htmlFor={name}
        className={cn(
          "block text-sm font-medium text-gray-700 mb-1",
          labelClassName
        )}
      >
        {label}
      </label>
      <input
        id={name}
        type={type === 'date' ? 'text' : type}
        {...registerRest}
        {...props}
        onChange={(e) => {
          if (type === 'date') {
            handleDateInput(e);
          }
          if (externalOnChange) {
            externalOnChange(e);
          }
          registerRest.onChange(e);
        }}
        onBlur={(e) => {
          if (externalOnBlur) {
            externalOnBlur(e);
          }
          registerRest.onBlur(e);
        }}
        ref={(element) => {
          registerRef(element);
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
        }}
        placeholder={type === 'date' ? 'YYYYMMDD' : props.placeholder}
        className={cn(
          "mt-1 block w-full rounded-md border-gray-300 shadow-sm",
          "focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50",
          error && "border-red-500",
          className
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';