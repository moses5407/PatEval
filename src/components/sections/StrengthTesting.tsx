import React from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FormField } from '../ui/FormField';
import { FormSelect } from '../ui/FormSelect';
import { Section } from '../ui/Section';
import { bodyParts } from '../../lib/constants';
import { strengthTests } from '../../lib/constants/strengthTests';

export function StrengthTesting() {
  const { watch } = useFormContext();
  const selectedParts = watch('selectedParts') || [];

  const testTypeOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'strain_gauge', label: 'Strain gauge' },
    { value: 'isokinetic', label: 'Isokinetic' },
    { value: 'percent_rm', label: '%RM' }
  ];

  const getValidationRules = (testType: string) => {
    switch (testType) {
      case 'manual':
        return { step: 0.1, placeholder: '0-5 or higher' };
      case 'strain_gauge':
      case 'isokinetic':
        return { step: 0.1, placeholder: 'Value' };
      case 'percent_rm':
        return { min: 0, max: 1000, step: 0.1, placeholder: '0-100%' };
      default:
        return { step: 0.1, placeholder: 'Value' };
    }
  };

  const SpineStrengthTable = ({ partId, name }: { partId: string; name: string }) => {
    const tests = strengthTests[partId as keyof typeof strengthTests];
    if (!tests) return null;

    return (
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900">Movement</th>
              <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900">Muscle Group</th>
              <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 w-32">Test Type</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-20">Value</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-20">Angle</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-20">Speed</th>
              <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Object.entries(tests).map(([movement, muscles]) => {
              const testType = watch(`strengthTesting.${partId}.${movement}.testType`) || '';
              const validationRules = getValidationRules(testType);
              const needsAngle = testType === 'manual' || testType === 'strain_gauge';
              const needsSpeed = testType === 'isokinetic';

              return (
                <tr key={`${partId}-${movement}`} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-sm font-medium text-gray-900">
                    {movement.replace(/([A-Z])/g, ' $1').trim()}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-500">{muscles}</td>
                  <td className="px-2 py-2">
                    <FormSelect
                      name={`strengthTesting.${partId}.${movement}.testType`}
                      options={testTypeOptions}
                      className="w-32"
                      placeholder="Select test type"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      label=""
                      type="number"
                      name={`strengthTesting.${partId}.${movement}.value`}
                      placeholder={validationRules.placeholder}
                      className="w-20 text-center"
                      step={validationRules.step}
                      {...(validationRules.min !== undefined && { min: validationRules.min })}
                      {...(validationRules.max !== undefined && { max: validationRules.max })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    {needsAngle && (
                      <FormField
                        label=""
                        type="number"
                        name={`strengthTesting.${partId}.${movement}.angle`}
                        placeholder="°"
                        className="w-20 text-center"
                        step="0.1"
                        min="0"
                        max="360"
                      />
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {needsSpeed && (
                      <FormField
                        label=""
                        type="number"
                        name={`strengthTesting.${partId}.${movement}.speed`}
                        placeholder="°/s"
                        className="w-20 text-center"
                        step="0.1"
                        min="0"
                      />
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      label=""
                      type="text"
                      name={`strengthTesting.${partId}.${movement}.notes`}
                      placeholder="Add notes..."
                      className="w-full"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const JointStrengthTable = ({ partId, name }: { partId: string; name: string }) => {
    const tests = strengthTests[partId as keyof typeof strengthTests];
    if (!tests) return null;

    return (
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900">Movement</th>
              <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900">Muscle Group</th>
              <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 w-32">Test Type</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-20">Left</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-20">Right</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-20">Angle</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-20">Speed</th>
              <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Object.entries(tests).map(([movement, muscles]) => {
              const testType = watch(`strengthTesting.${partId}.${movement}.testType`) || '';
              const validationRules = getValidationRules(testType);
              const needsAngle = testType === 'manual' || testType === 'strain_gauge';
              const needsSpeed = testType === 'isokinetic';

              return (
                <tr key={`${partId}-${movement}`} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-sm font-medium text-gray-900">
                    {movement.replace(/([A-Z])/g, ' $1').trim()}
                  </td>
                  <td className="px-2 py-2 text-sm text-gray-500">{muscles}</td>
                  <td className="px-2 py-2">
                    <FormSelect
                      name={`strengthTesting.${partId}.${movement}.testType`}
                      options={testTypeOptions}
                      className="w-32"
                      placeholder="Select test type"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      label=""
                      type="number"
                      name={`strengthTesting.${partId}.${movement}.left`}
                      placeholder={validationRules.placeholder}
                      className="w-20 text-center"
                      step={validationRules.step}
                      {...(validationRules.min !== undefined && { min: validationRules.min })}
                      {...(validationRules.max !== undefined && { max: validationRules.max })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      label=""
                      type="number"
                      name={`strengthTesting.${partId}.${movement}.right`}
                      placeholder={validationRules.placeholder}
                      className="w-20 text-center"
                      step={validationRules.step}
                      {...(validationRules.min !== undefined && { min: validationRules.min })}
                      {...(validationRules.max !== undefined && { max: validationRules.max })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    {needsAngle && (
                      <FormField
                        label=""
                        type="number"
                        name={`strengthTesting.${partId}.${movement}.angle`}
                        placeholder="°"
                        className="w-20 text-center"
                        step="0.1"
                        min="0"
                        max="360"
                      />
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {needsSpeed && (
                      <FormField
                        label=""
                        type="number"
                        name={`strengthTesting.${partId}.${movement}.speed`}
                        placeholder="°/s"
                        className="w-20 text-center"
                        step="0.1"
                        min="0"
                      />
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      label=""
                      type="text"
                      name={`strengthTesting.${partId}.${movement}.notes`}
                      placeholder="Add notes..."
                      className="w-full"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (selectedParts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-500 italic text-center py-4"
      >
        Select problems in the Problem Selection section to record strength measurements.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {selectedParts.map((partId) => {
        const part = bodyParts[partId as keyof typeof bodyParts];
        if (!part) return null;

        return (
          <Section key={partId} title={part.name}>
            {part.type === 'spine' ? (
              <SpineStrengthTable partId={partId} name={part.name} />
            ) : (
              <JointStrengthTable partId={partId} name={part.name} />
            )}
          </Section>
        );
      })}
    </motion.div>
  );
}