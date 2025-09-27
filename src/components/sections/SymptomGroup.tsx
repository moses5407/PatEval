import React, { useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormField } from '../ui/FormField';
import { DateField } from '../ui/DateField';
import { MultiSelect } from '../ui/MultiSelect';
import { Section } from '../ui/Section';
import { Side, Surface, SymptomGroup as SymptomGroupType } from '../../types';
import { bodyParts } from '../../lib/constants';
import { locations } from '../../lib/constants/locations';

const symptoms = [
  { id: 'pain', label: 'Pain' },
  { id: 'swelling', label: 'Swelling' },
  { id: 'stiffness', label: 'Stiffness' },
  { id: 'weakness', label: 'Weakness' },
  { id: 'instability', label: 'Instability' },
  { id: 'numbness', label: 'Numbness' },
  { id: 'tingling', label: 'Tingling' }
];

const aggravatingFactors = [
  { id: 'sitting', label: 'Sitting' },
  { id: 'standing', label: 'Standing' },
  { id: 'walking', label: 'Walking' },
  { id: 'lifting', label: 'Lifting' },
  { id: 'bending', label: 'Bending' },
  { id: 'rotation', label: 'Rotation' },
  { id: 'pressure', label: 'Pressure' }
];

const alleviatingFactors = [
  { id: 'rest', label: 'Rest' },
  { id: 'ice', label: 'Ice' },
  { id: 'heat', label: 'Heat' },
  { id: 'medication', label: 'Medication' },
  { id: 'position', label: 'Position Change' },
  { id: 'movement', label: 'Movement' },
  { id: 'stretching', label: 'Stretching' }
];

interface SymptomGroupProps {
  bodyPartId: string;
  groupIndex: number;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function SymptomGroup({ 
  bodyPartId, 
  groupIndex, 
  onRemove,
  isExpanded,
  onToggleExpand
}: SymptomGroupProps) {
  const { register, watch, setValue } = useFormContext();
  const part = bodyParts[bodyPartId as keyof typeof bodyParts];
  const fieldPrefix = `problems.${bodyPartId}.symptomGroups.${groupIndex}`;
  const firstInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && firstInputRef.current) {
      const timeoutId = setTimeout(() => {
        firstInputRef.current?.focus();
        containerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest'
        });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isExpanded]);

  if (!part) return null;

  return (
    <div ref={containerRef} className="border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-2 text-sm font-medium text-gray-900"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          Symptom Group {groupIndex + 1}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-gray-200 p-4 space-y-4">
              {part.bilateral && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Side</label>
                  <div className="flex gap-4">
                    {[
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' }, 
                      { value: 'bilateral', label: 'Bilateral' }
                    ].map(({ value, label }) => {
                      const isSelected = watch(`${fieldPrefix}.side`) === value;
                      return (
                        <label key={value} className="flex items-center cursor-pointer">
                          <div className="relative flex items-center">
                            <input
                              type="radio"
                              {...register(`${fieldPrefix}.side`)}
                              value={value}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors ${
                              isSelected ? 'border-black' : 'border-gray-300'
                            }`}>
                              <div className={`w-2 h-2 bg-black rounded-full transition-opacity ${
                                isSelected ? 'opacity-100' : 'opacity-0'
                              }`}></div>
                            </div>
                          </div>
                          <span className="ml-2 text-sm">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <MultiSelect
                  options={locations}
                  value={watch(`${fieldPrefix}.location`) || []}
                  onChange={(value) => setValue(`${fieldPrefix}.location`, value)}
                  placeholder="Select locations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                <MultiSelect
                  options={symptoms}
                  value={watch(`${fieldPrefix}.symptoms`) || []}
                  onChange={(value) => setValue(`${fieldPrefix}.symptoms`, value)}
                  placeholder="Select symptoms..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity (0-10)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  {...register(`${fieldPrefix}.severity`)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Least</span>
                  <span>Most</span>
                </div>
              </div>

              <DateField
                label="Onset Date"
                {...register(`${fieldPrefix}.onset`)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aggravating Factors</label>
                <MultiSelect
                  options={aggravatingFactors}
                  value={watch(`${fieldPrefix}.aggravating`) || []}
                  onChange={(value) => setValue(`${fieldPrefix}.aggravating`, value)}
                  placeholder="Select factors..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alleviating Factors</label>
                <MultiSelect
                  options={alleviatingFactors}
                  value={watch(`${fieldPrefix}.alleviating`) || []}
                  onChange={(value) => setValue(`${fieldPrefix}.alleviating`, value)}
                  placeholder="Select factors..."
                />
              </div>

              <FormField
                label="Description"
                {...register(`${fieldPrefix}.description`)}
                placeholder="Additional details about symptoms..."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}