import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../ui/FormField';
import { FormSelect } from '../ui/FormSelect';
import { Button } from '../ui/Button';

const resultOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'abnormal', label: 'Abnormal' },
  { value: 'unable', label: 'Unable to Perform' },
  { value: 'modified', label: 'Modified' }
];

const upperQuarterTests = [
  'shoulderFlexion',
  'functionalReach',
  'ndi',
  'dashQuickDash',
  'gripStrength'
];

const upperQuarterTestNames = {
  shoulderFlexion: 'Shoulder Flexion',
  functionalReach: 'Functional Reach',
  ndi: 'NDI',
  dashQuickDash: 'DASH QuickDASH',
  gripStrength: 'Grip Strength'
};

const lowerQuarterTests = [
  'singleLegStance',
  'functionalSquat',
  'stepDown',
  'tug',
  'sixMinWalk',
  'starExcursion'
];

const lowerQuarterTestNames = {
  singleLegStance: 'Single Leg Stance',
  functionalSquat: 'Functional Squat',
  stepDown: 'Step Down',
  tug: 'TUG',
  sixMinWalk: '6 Min Walk',
  starExcursion: 'Star Excursion'
};

const wholeBodyTests = [
  'fms',
  'bergBalance',
  'adlAssessment',
  'staticPosture',
  'gaitAnalysis'
];

const wholeBodyTestNames = {
  fms: 'FMS',
  bergBalance: 'Berg Balance',
  adlAssessment: 'ADL Assessment',
  staticPosture: 'Static Posture',
  gaitAnalysis: 'Gait Analysis'
};

interface TestTableProps {
  title: string;
  tests: string[];
  testNames: { [key: string]: string };
  sectionKey: string;
}

function TestTable({ title, tests, testNames, sectionKey }: TestTableProps) {
  const { register } = useFormContext();

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-100">
        <h4 className="text-base font-medium text-gray-900">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Test Name</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 w-32">Result</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 w-24">Score</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tests.map((test) => (
              <tr key={test} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  {testNames[test]}
                </td>
                <td className="px-4 py-2">
                  <FormSelect
                    name={`functionalTesting.${sectionKey}.${test}.result`}
                    options={resultOptions}
                    placeholder="Select"
                    className="w-32"
                  />
                </td>
                <td className="px-4 py-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    Score
                  </Button>
                </td>
                <td className="px-4 py-2">
                  <FormField
                    type="text"
                    {...register(`functionalTesting.${sectionKey}.${test}.notes`)}
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
}

export function FunctionalTesting() {
  return (
    <div className="space-y-6">
      <TestTable
        title="Upper Quarter"
        tests={upperQuarterTests}
        testNames={upperQuarterTestNames}
        sectionKey="upperQuarter"
      />
      
      <TestTable
        title="Lower Quarter"
        tests={lowerQuarterTests}
        testNames={lowerQuarterTestNames}
        sectionKey="lowerQuarter"
      />
      
      <TestTable
        title="Whole Body"
        tests={wholeBodyTests}
        testNames={wholeBodyTestNames}
        sectionKey="wholeBody"
      />
    </div>
  );
}