import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  id: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, value, onChange, placeholder = 'Select options...' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Tab':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
        }
        break;
      case 'Escape':
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
        }
        break;
      case 'ArrowDown':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
          optionsRef.current[focusedIndex + 1]?.scrollIntoView({ block: 'nearest' });
        }
        break;
      case 'ArrowUp':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
          optionsRef.current[focusedIndex - 1]?.scrollIntoView({ block: 'nearest' });
        }
        break;
      case 'Enter':
      case ' ':
        if (isOpen && focusedIndex >= 0) {
          e.preventDefault();
          handleOptionClick(options[focusedIndex].id);
        }
        break;
    }
  };

  const handleOptionClick = (optionId: string) => {
    const newValue = value.includes(optionId)
      ? value.filter(id => id !== optionId)
      : [...value, optionId];
    onChange(newValue);
  };

  return (
    <div 
      className="relative" 
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm",
          "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
          isOpen && "border-blue-500 ring-1 ring-blue-500"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="block truncate">
            {value.length > 0
              ? options
                  .filter(option => value.includes(option.id))
                  .map(option => option.label)
                  .join(', ')
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </button>

      {isOpen && (
        <div 
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
          role="listbox"
          tabIndex={-1}
        >
          {options.map((option, index) => (
            <div
              key={option.id}
              ref={el => optionsRef.current[index] = el}
              onClick={() => handleOptionClick(option.id)}
              className={cn(
                "relative cursor-pointer select-none px-3 py-2 text-sm",
                "hover:bg-blue-50",
                focusedIndex === index && "bg-blue-50",
                value.includes(option.id) && "bg-blue-50"
              )}
              role="option"
              aria-selected={value.includes(option.id)}
            >
              <div className="flex items-center">
                <span className={cn(
                  "block truncate",
                  value.includes(option.id) && "font-semibold text-blue-600"
                )}>
                  {option.label}
                </span>
                {value.includes(option.id) && (
                  <Check className="ml-auto h-4 w-4 text-blue-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}