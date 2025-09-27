import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { specialTests } from '../../lib/constants';
import { FormField } from '../ui/FormField';
import { Select } from '../ui/Select';
import { Section } from '../ui/Section';
import { TestInstructionPopup } from '../ui/TestInstructionPopup';

type JointKey = keyof typeof specialTests;

const TEST_RESULTS = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'inconclusive', label: 'Inconclusive' }
] as const;

export function SpecialTests() {
  const { watch, register, setValue } = useFormContext();
  const selectedParts = watch('selectedParts') || [];

  const getTestsTable = (partId: string) => {
    const part = specialTests[partId as JointKey];
    if (!part) return null;

    const hasSides = ['shoulder', 'knee', 'hip', 'ankle', 'elbow', 'wrist'].includes(partId);

    return (
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="py-2 px-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Test</th>
                {hasSides ? (
                  <>
                    <th scope="col" className="py-2 px-3 text-center text-sm font-semibold text-gray-900 bg-gray-50 w-24">Left</th>
                    <th scope="col" className="py-2 px-3 text-center text-sm font-semibold text-gray-900 bg-gray-50 w-24">Right</th>
                  </>
                ) : (
                  <th scope="col" className="py-2 px-3 text-center text-sm font-semibold text-gray-900 bg-gray-50 w-24">Result</th>
                )}
                <th scope="col" className="py-2 px-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Object.entries(part.tests).map(([testId, test]) => (
                <tr key={testId}>
                  <td className="py-2 px-3 text-sm">
                    <TestInstructionPopup
                      name={test.name}
                      description={test.description}
                      instructions={test.instructions}
                    />
                  </td>
                  {hasSides ? (
                    <>
                      <td className="py-2 px-3">
                        <Select
                          options={TEST_RESULTS}
                          value={watch(`specialTests.${partId}.${testId}.left`) || ''}
                          onChange={(value) => setValue(`specialTests.${partId}.${testId}.left`, value)}
                          placeholder="Select"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <Select
                          options={TEST_RESULTS}
                          value={watch(`specialTests.${partId}.${testId}.right`) || ''}
                          onChange={(value) => setValue(`specialTests.${partId}.${testId}.right`, value)}
                          placeholder="Select"
                        />
                      </td>
                    </>
                  ) : (
                    <td className="py-2 px-3">
                      <Select
                        options={TEST_RESULTS}
                        value={watch(`specialTests.${partId}.${testId}.result`) || ''}
                        onChange={(value) => setValue(`specialTests.${partId}.${testId}.result`, value)}
                        placeholder="Select"
                      />
                    </td>
                  )}
                  <td className="py-2 px-3">
                    <FormField
                      type="text"
                      {...register(`specialTests.${partId}.${testId}.notes`)}
                      placeholder="Add notes..."
                      className="w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        Select problems in the Problem Selection section to view special tests.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {selectedParts.map((partId: string) => {
        const part = specialTests[partId as JointKey];
        if (!part) return null;

        return (
          <Section key={partId} title={part.name}>
            {getTestsTable(partId)}
          </Section>
        );
      })}
    </motion.div>
  );
}