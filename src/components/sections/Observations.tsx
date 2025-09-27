import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField } from '../ui/FormField';
import { FormSelect } from '../ui/FormSelect';
import { MultiSelect } from '../ui/MultiSelect';
import { Button } from '../ui/Button';
import { PhotoCapture } from '../ui/PhotoCapture';
import { Cross } from 'lucide-react';

const normalAbnormalOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'abnormal', label: 'Abnormal' }
];

const skinIntegumentaryOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'abnormal', label: 'Abnormal' },
  { value: 'wound', label: 'Wound Present' },
  { value: 'scar', label: 'Scar Tissue' },
  { value: 'discoloration', label: 'Discoloration' }
];

const assistiveDeviceOptions = [
  { id: 'none', label: 'None' },
  { id: 'cane', label: 'Cane' },
  { id: 'walker', label: 'Walker' },
  { id: 'crutches', label: 'Crutches' },
  { id: 'wheelchair', label: 'Wheelchair' },
  { id: 'brace', label: 'Brace/Orthotic' },
  { id: 'prosthetic', label: 'Prosthetic' }
];

const generalAppearanceOptions = [
  { id: 'alert_oriented', label: 'Alert & Oriented' },
  { id: 'cooperative', label: 'Cooperative' },
  { id: 'anxious', label: 'Anxious' },
  { id: 'guarded', label: 'Guarded' },
  { id: 'distressed', label: 'In Distress' },
  { id: 'lethargic', label: 'Lethargic' }
];

const bodyTypeOptions = [
  { value: 'ectomorph', label: 'Ectomorph (Lean)' },
  { value: 'mesomorph', label: 'Mesomorph (Muscular)' },
  { value: 'endomorph', label: 'Endomorph (Larger Build)' },
  { value: 'average', label: 'Average Build' }
];

export function Observations() {
  const { register, watch, setValue, getValues } = useFormContext();
  const [wounds, setWounds] = useState([]);

  // Watch for changes in observation data to implement smart inclusion logic
  const postureAssessment = watch('observations.posture.assessment');
  const postureNotes = watch('observations.posture.notes');
  const gaitAssessment = watch('observations.gait.assessment');
  const gaitNotes = watch('observations.gait.notes');
  const skinAssessment = watch('observations.skinIntegumentary.assessment');
  const skinNotes = watch('observations.skinIntegumentary.notes');
  const assistiveDevices = watch('observations.assistiveDevices.devices');
  const assistiveDevicesNotes = watch('observations.assistiveDevices.notes');
  const generalAppearanceAssessment = watch('observations.generalAppearance.assessment');
  const generalAppearanceNotes = watch('observations.generalAppearance.notes');
  const bodyTypeAssessment = watch('observations.bodyType.assessment');
  const bodyTypeNotes = watch('observations.bodyType.notes');

  // Smart inclusion logic: automatically check "Include in Summary" when findings are entered
  useEffect(() => {
    // Posture: auto-include if assessment is not empty or notes are provided
    if ((postureAssessment && postureAssessment !== '') || (postureNotes && postureNotes.trim() !== '')) {
      setValue('observations.posture.includeInSummary', true);
    }
  }, [postureAssessment, postureNotes, setValue]);

  useEffect(() => {
    // Gait: auto-include if assessment is not empty or notes are provided
    if ((gaitAssessment && gaitAssessment !== '') || (gaitNotes && gaitNotes.trim() !== '')) {
      setValue('observations.gait.includeInSummary', true);
    }
  }, [gaitAssessment, gaitNotes, setValue]);

  useEffect(() => {
    // Skin/Integumentary: auto-include if assessment is not empty, notes provided, or wounds exist
    if ((skinAssessment && skinAssessment !== '') || 
        (skinNotes && skinNotes.trim() !== '') || 
        (wounds && wounds.length > 0)) {
      setValue('observations.skinIntegumentary.includeInSummary', true);
    }
  }, [skinAssessment, skinNotes, wounds, setValue]);

  useEffect(() => {
    // Assistive Devices: auto-include if devices selected or notes provided
    if ((assistiveDevices && assistiveDevices.length > 0) || 
        (assistiveDevicesNotes && assistiveDevicesNotes.trim() !== '')) {
      setValue('observations.assistiveDevices.includeInSummary', true);
    }
  }, [assistiveDevices, assistiveDevicesNotes, setValue]);

  useEffect(() => {
    // General Appearance: auto-include if assessment array has items or notes are provided
    if ((generalAppearanceAssessment && generalAppearanceAssessment.length > 0) || 
        (generalAppearanceNotes && generalAppearanceNotes.trim() !== '')) {
      setValue('observations.generalAppearance.includeInSummary', true);
    }
  }, [generalAppearanceAssessment, generalAppearanceNotes, setValue]);

  useEffect(() => {
    // Body Type: auto-include if assessment is not empty or notes are provided
    if ((bodyTypeAssessment && bodyTypeAssessment !== '') || 
        (bodyTypeNotes && bodyTypeNotes.trim() !== '')) {
      setValue('observations.bodyType.includeInSummary', true);
    }
  }, [bodyTypeAssessment, bodyTypeNotes, setValue]);

  // Initialize wounds from form data
  useEffect(() => {
    const formWounds = getValues('observations.skinIntegumentary.wounds');
    if (Array.isArray(formWounds)) {
      setWounds(formWounds);
    }
  }, [getValues]);

  const addWound = () => {
    try {
      const newWound = {
        id: Date.now().toString(),
        location: '',
        type: '',
        length: '',
        width: '',
        depth: '',
        notes: '',
        photo: ''
      };
      const updatedWounds = [...(wounds || []), newWound];
      setWounds(updatedWounds);
      setValue('observations.skinIntegumentary.wounds', updatedWounds);
      // Automatically include skin/integumentary in summary when wounds are added
      setValue('observations.skinIntegumentary.includeInSummary', true);
    } catch (error) {
      console.error('Error adding wound:', error);
    }
  };

  const removeWound = (woundId: string) => {
    try {
      const updatedWounds = (wounds || []).filter(wound => wound.id !== woundId);
      setWounds(updatedWounds);
      setValue('observations.skinIntegumentary.wounds', updatedWounds);
      // Keep the section included if there are still wounds or other findings
      if (updatedWounds.length === 0 && 
          (!skinAssessment || skinAssessment === '') && 
          (!skinNotes || skinNotes.trim() === '')) {
        // Only uncheck if no wounds remain and no other skin findings
        setValue('observations.skinIntegumentary.includeInSummary', false);
      }
    } catch (error) {
      console.error('Error removing wound:', error);
    }
  };

  const updateWound = (woundId: string, field: string, value: string) => {
    try {
      const updatedWounds = (wounds || []).map(wound => 
        wound.id === woundId ? { ...wound, [field]: value } : wound
      );
      setWounds(updatedWounds);
      setValue('observations.skinIntegumentary.wounds', updatedWounds);
      // Automatically include skin/integumentary when wound data is entered
      if (value && value.trim() !== '') {
        setValue('observations.skinIntegumentary.includeInSummary', true);
      }
    } catch (error) {
      console.error('Error updating wound:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Posture */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-gray-900">Posture</h4>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('observations.posture.includeInSummary')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Include Posture in Summary
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormSelect
              name="observations.posture.assessment"
              label="Assessment"
              options={normalAbnormalOptions}
              placeholder="Select assessment"
            />
            <FormField
              label="Notes"
              type="text"
              {...register('observations.posture.notes')}
              placeholder="Additional notes..."
            />
          </div>
        </div>
      </div>

      {/* Gait */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-gray-900">Gait</h4>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('observations.gait.includeInSummary')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Include Gait in Summary
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormSelect
              name="observations.gait.assessment"
              label="Assessment"
              options={normalAbnormalOptions}
              placeholder="Select assessment"
            />
            <FormField
              label="Notes"
              type="text"
              {...register('observations.gait.notes')}
              placeholder="Additional notes..."
            />
          </div>
        </div>
      </div>

      {/* Skin/Integumentary */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-gray-900">Skin/Integumentary</h4>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('observations.skinIntegumentary.includeInSummary')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Include Skin/Integumentary in Summary
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormSelect
              name="observations.skinIntegumentary.assessment"
              label="Assessment"
              options={skinIntegumentaryOptions}
              placeholder="Select assessment"
            />
            <FormField
              label="General Notes"
              type="text"
              {...register('observations.skinIntegumentary.notes')}
              placeholder="General notes..."
            />
          </div>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="text-sm"
              onClick={addWound}
            >
              Add Wound
            </Button>
          </div>
          {Array.isArray(wounds) && wounds.length > 0 && (
            <div className="mt-4 space-y-4">
              {wounds.map((wound, index) => {
                if (!wound || !wound.id) return null;
                return (
                  <div key={wound.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-900">Wound {index + 1}</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeWound(wound.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={wound.location || ''}
                          onChange={(e) => updateWound(wound.id, 'location', e.target.value)}
                          placeholder="e.g., Left ankle"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <input
                          type="text"
                          value={wound.type || ''}
                          onChange={(e) => updateWound(wound.id, 'type', e.target.value)}
                          placeholder="e.g., Surgical, Laceration"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                        <input
                          type="text"
                          value={wound.length || ''}
                          onChange={(e) => updateWound(wound.id, 'length', e.target.value)}
                          placeholder="e.g., 5.2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                        <input
                          type="text"
                          value={wound.width || ''}
                          onChange={(e) => updateWound(wound.id, 'width', e.target.value)}
                          placeholder="e.g., 2.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Depth (cm)</label>
                        <input
                          type="text"
                          value={wound.depth || ''}
                          onChange={(e) => updateWound(wound.id, 'depth', e.target.value)}
                          placeholder="e.g., 0.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <input
                          type="text"
                          value={wound.notes || ''}
                          onChange={(e) => updateWound(wound.id, 'notes', e.target.value)}
                          placeholder="Additional notes..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    {/* Wound Photo Section */}
                    <div className="mt-4">
                      <PhotoCapture
                        value={wound.photo || ''}
                        onChange={(photo) => updateWound(wound.id, 'photo', photo)}
                        label="Wound Photo"
                        placeholder={<Cross className="h-12 w-12 text-gray-400" />}
                        className=""
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Assistive Devices */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-gray-900">Assistive Devices</h4>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('observations.assistiveDevices.includeInSummary')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Include Assistive Devices in Summary
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Devices</label>
              <MultiSelect
                options={assistiveDeviceOptions}
                value={watch('observations.assistiveDevices.devices') || []}
                onChange={(value) => setValue('observations.assistiveDevices.devices', value)}
                placeholder="Select devices..."
              />
            </div>
            <FormField
              label="Notes"
              type="text"
              {...register('observations.assistiveDevices.notes')}
              placeholder="Additional notes..."
            />
          </div>
        </div>
      </div>

      {/* General Appearance/Behavior */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-gray-900">General Appearance/Behavior</h4>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('observations.generalAppearance.includeInSummary')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Include General Appearance in Summary
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assessment</label>
              <MultiSelect
                options={generalAppearanceOptions}
                value={watch('observations.generalAppearance.assessment') || []}
                onChange={(value) => setValue('observations.generalAppearance.assessment', value)}
                placeholder="Select assessments..."
              />
            </div>
            <FormField
              label="Notes"
              type="text"
              {...register('observations.generalAppearance.notes')}
              placeholder="Additional notes..."
            />
          </div>
        </div>
      </div>

      {/* General Body Type */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-gray-900">General Body Type</h4>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('observations.bodyType.includeInSummary')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Include Body Type in Summary
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormSelect
              name="observations.bodyType.assessment"
              label="Body Type"
              options={bodyTypeOptions}
              placeholder="Select body type"
            />
            <FormField
              label="Notes"
              type="text"
              {...register('observations.bodyType.notes')}
              placeholder="Additional notes..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}