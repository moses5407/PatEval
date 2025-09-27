import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FormField } from '../ui/FormField';
import { jointROM, bodyParts } from '../../lib/constants';
import { calculateAge } from '../../lib/utils';
import { Section } from '../ui/Section';

export function RangeOfMotion() {
  const { watch } = useFormContext();
  const selectedParts = watch('selectedParts') || [];
  const birthDate = watch('demographics.dateOfBirth');
  const age = birthDate ? calculateAge(birthDate) : 0;

  const getAgeAdjustedROM = (baseValue: number) => {
    if (age > 65) {
      return Math.round(baseValue * 0.85);
    }
    return baseValue;
  };

  const SpineROMTable = ({ partId, name }: { partId: string; name: string }) => {
    const romData = jointROM[partId as keyof typeof jointROM];
    if (!romData) return null;

    return (
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 w-24">Motion</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-16">Norm</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-16">AROM</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-16">PROM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Object.entries(romData).map(([motion, { max }]) => {
              const ageAdjusted = getAgeAdjustedROM(max);
              const isRotationOrLateralFlexion = motion.includes('rotation') || motion.includes('lateralFlexion');

              if (isRotationOrLateralFlexion) {
                return ['left', 'right'].map((side) => (
                  <tr key={`${partId}-${motion}-${side}`} className="hover:bg-gray-50">
                    <td className="px-2 py-2 text-sm font-medium text-gray-900">
                      {`${side.charAt(0).toUpperCase() + side.slice(1)} ${motion.replace(/([A-Z])/g, ' $1').trim()}`}
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-gray-900">
                      {ageAdjusted}°
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        type="number"
                        name={`rangeOfMotion.${partId}.${motion}.active.${side}`}
                        placeholder={ageAdjusted.toString()}
                        className="w-16 text-center"
                        min={0}
                        max={180}
                        step={0.1}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        type="number"
                        name={`rangeOfMotion.${partId}.${motion}.passive.${side}`}
                        placeholder={ageAdjusted.toString()}
                        className="w-16 text-center"
                        min={0}
                        max={180}
                        step={0.1}
                      />
                    </td>
                  </tr>
                ));
              }

              return (
                <tr key={`${partId}-${motion}`} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-sm font-medium text-gray-900">
                    {motion.charAt(0).toUpperCase() + motion.slice(1)}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-gray-900">
                    {ageAdjusted}°
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      type="number"
                      name={`rangeOfMotion.${partId}.${motion}.active.value`}
                      placeholder={ageAdjusted.toString()}
                      className="w-16 text-center"
                      min={0}
                      max={180}
                      step={0.1}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      type="number"
                      name={`rangeOfMotion.${partId}.${motion}.passive.value`}
                      placeholder={ageAdjusted.toString()}
                      className="w-16 text-center"
                      min={0}
                      max={180}
                      step={0.1}
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

  const JointROMTable = ({ partId, name }: { partId: string; name: string }) => {
    const romData = jointROM[partId as keyof typeof jointROM];
    if (!romData) return null;

    return (
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 w-24">Motion</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900 w-16">Norm</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900" colSpan={2}>Left</th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-gray-900" colSpan={2}>Right</th>
            </tr>
            <tr className="bg-gray-50">
              <th></th>
              <th></th>
              <th className="px-2 py-1 text-center text-sm font-semibold text-gray-900 w-16">A</th>
              <th className="px-2 py-1 text-center text-sm font-semibold text-gray-900 w-16">P</th>
              <th className="px-2 py-1 text-center text-sm font-semibold text-gray-900 w-16">A</th>
              <th className="px-2 py-1 text-center text-sm font-semibold text-gray-900 w-16">P</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Object.entries(romData).map(([motion, { max }]) => {
              const ageAdjusted = getAgeAdjustedROM(max);
              return (
                <tr key={`${partId}-${motion}`} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-sm font-medium text-gray-900">
                    {motion.replace(/([A-Z])/g, ' $1').trim()}
                  </td>
                  <td className="px-2 py-2 text-center text-sm text-gray-900">
                    {ageAdjusted}°
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      type="number"
                      name={`rangeOfMotion.${partId}.${motion}.active.left`}
                      placeholder={ageAdjusted.toString()}
                      className="w-16 text-center"
                      min={0}
                      max={180}
                      step={0.1}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      type="number"
                      name={`rangeOfMotion.${partId}.${motion}.passive.left`}
                      placeholder={ageAdjusted.toString()}
                      className="w-16 text-center"
                      min={0}
                      max={180}
                      step={0.1}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      type="number"
                      name={`rangeOfMotion.${partId}.${motion}.active.right`}
                      placeholder={ageAdjusted.toString()}
                      className="w-16 text-center"
                      min={0}
                      max={180}
                      step={0.1}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <FormField
                      type="number"
                      name={`rangeOfMotion.${partId}.${motion}.passive.right`}
                      placeholder={ageAdjusted.toString()}
                      className="w-16 text-center"
                      min={0}
                      max={180}
                      step={0.1}
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
        Select problems that require range of motion measurements to begin.
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
        if (!part || !part.hasROM) return null;

        return (
          <Section key={partId} title={part.name} defaultOpen={false}>
            {part.type === 'spine' ? (
              <SpineROMTable partId={partId} name={part.name} />
            ) : (
              <JointROMTable partId={partId} name={part.name} />
            )}
          </Section>
        );
      })}
    </motion.div>
  );
}