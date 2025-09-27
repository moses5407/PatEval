import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { cn } from '../../lib/utils';
import { PatientForm } from '../../types';

interface SectionWithCheckboxProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  checkboxName: keyof PatientForm['summaryInclusion'];
  register: UseFormRegister<PatientForm>;
}

export function SectionWithCheckbox({ 
  title, 
  children, 
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  className,
  checkboxName,
  register
}: SectionWithCheckboxProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(defaultOpen);
  
  // Use controlled state if provided, otherwise use internal state
  const isControlled = controlledIsOpen !== undefined && onToggle !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;
  
  const handleToggle = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setUncontrolledIsOpen(!uncontrolledIsOpen);
    }
  };

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center justify-between flex-1 text-left mr-4"
        >
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <ChevronDown
            className={cn('h-5 w-5 transform transition-transform', isOpen && 'rotate-180')}
          />
        </button>
        <label 
          className="flex items-center gap-2 text-sm cursor-pointer" 
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            {...register(`summaryInclusion.${checkboxName}`)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          Include in Summary
        </label>
      </div>
      {/* Always render children to ensure state initialization - animate when open */}
      <div className={cn('border-t border-gray-200', !isOpen && 'sr-only')}>
        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-4"
            >
              {children}
            </motion.div>
          ) : (
            <div className="px-4 py-4">
              {children}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}