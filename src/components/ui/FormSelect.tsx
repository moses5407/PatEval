import React, { forwardRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  name: string;
  options: SelectOption[];
  className?: string;
  labelClassName?: string;
  error?: string;
  standalone?: boolean;
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(({
  label,
  name,
  options,
  className = '',
  labelClassName = '',
  error,
  standalone = false,
  placeholder,
  onChange: externalOnChange,
  onBlur: externalOnBlur,
  ...props
}, ref) => {
  const context = useFormContext();
  const register = context?.register;

  // If standalone or no form context, use regular select behavior
  if (standalone || !register) {
    return (
      <div className={label ? "mb-4" : ""}>
        {label && (
          <label 
            htmlFor={name}
            className={cn(
              "block text-sm font-medium text-gray-700 mb-1",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={name}
            className={cn(
              "block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500",
              error && "border-red-500",
              className
            )}
            onChange={externalOnChange}
            onBlur={externalOnBlur}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // Form context is available, use react-hook-form registration
  const { ref: registerRef, ...registerRest } = register(name);

  return (
    <div className={label ? "mb-4" : ""}>
      {label && (
        <label 
          htmlFor={name}
          className={cn(
            "block text-sm font-medium text-gray-700 mb-1",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          {...registerRest}
          {...props}
          onChange={(e) => {
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
          className={cn(
            "block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500",
            error && "border-red-500",
            className
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';