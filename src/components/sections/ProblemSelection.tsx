import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { FormField } from '../ui/FormField';
import { MultiSelect } from '../ui/MultiSelect';
import { Section } from '../ui/Section';
import { Button } from '../ui/Button';
import { SymptomGroup } from './SymptomGroup';
import { bodyParts } from '../../lib/constants';
import { generateId } from '../../lib/utils';

export function ProblemSelection() {
  const { watch, setValue } = useFormContext();
  const selectedParts = watch('selectedParts') || [];
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  // Watch for changes in selectedParts to auto-expand new sections and create initial symptom groups
  useEffect(() => {
    const currentProblems = watch('problems') || {};
    const updates: { [key: string]: any } = {};
    let newExpandedGroups = { ...expandedGroups };
    let newExpandedSections = { ...expandedSections };

    selectedParts.forEach((partId) => {
      // If this part doesn't have any symptom groups yet, create one
      if (!currentProblems[partId]?.symptomGroups?.length) {
        const newGroupId = generateId();
        updates[partId] = {
          symptomGroups: [{
            id: newGroupId,
            location: [],
            side: '',
            symptoms: [],
            severity: 5,
            description: '',
            onset: '',
            aggravating: [],
            alleviating: []
          }]
        };
        // Auto-expand the new symptom group
        newExpandedGroups[newGroupId] = true;
      }
      // Auto-expand the section
      newExpandedSections[partId] = true;
    });

    // Update form state if we have new symptom groups
    if (Object.keys(updates).length > 0) {
      setValue('problems', {
        ...currentProblems,
        ...Object.fromEntries(
          Object.entries(updates).map(([partId, data]) => [
            partId,
            {
              ...currentProblems[partId],
              ...data
            }
          ])
        )
      });
      setExpandedGroups(newExpandedGroups);
    }

    setExpandedSections(newExpandedSections);
  }, [selectedParts]);

  const addSymptomGroup = (partId: string) => {
    const currentGroups = watch(`problems.${partId}.symptomGroups`) || [];
    const newGroupId = generateId();
    
    setExpandedGroups(prev => ({
      ...prev,
      [newGroupId]: true
    }));

    setValue(`problems.${partId}.symptomGroups`, [
      ...currentGroups,
      {
        id: newGroupId,
        location: [],
        side: '',
        symptoms: [],
        severity: 5,
        description: '',
        onset: '',
        aggravating: [],
        alleviating: []
      }
    ]);
  };

  const removeSymptomGroup = (partId: string, groupIndex: number) => {
    const currentGroups = watch(`problems.${partId}.symptomGroups`) || [];
    const groupToRemove = currentGroups[groupIndex];
    
    const { [groupToRemove.id]: _, ...remainingExpandedGroups } = expandedGroups;
    setExpandedGroups(remainingExpandedGroups);

    const newGroups = [...currentGroups];
    newGroups.splice(groupIndex, 1);
    setValue(`problems.${partId}.symptomGroups`, newGroups);
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleSectionExpansion = (partId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [partId]: !prev[partId]
    }));
  };

  const bodyPartOptions = Object.entries(bodyParts).map(([id, part]) => ({
    id,
    label: part.name
  }));

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Problem Areas
        </label>
        <MultiSelect
          options={bodyPartOptions}
          value={selectedParts}
          onChange={(value) => setValue('selectedParts', value)}
          placeholder="Select body parts..."
        />
      </div>

      <div className="space-y-4">
        {selectedParts.map((partId: string) => {
          const part = bodyParts[partId as keyof typeof bodyParts];
          if (!part) return null;

          const symptomGroups = watch(`problems.${partId}.symptomGroups`) || [];

          return (
            <Section 
              key={partId} 
              title={part.name}
              className="bg-gray-50 border-gray-200"
              isOpen={expandedSections[partId]}
              onToggle={() => toggleSectionExpansion(partId)}
            >
              <div className="space-y-4">
                {symptomGroups.map((group: any, index: number) => (
                  <SymptomGroup
                    key={group.id}
                    bodyPartId={partId}
                    groupIndex={index}
                    onRemove={() => removeSymptomGroup(partId, index)}
                    isExpanded={expandedGroups[group.id]}
                    onToggleExpand={() => toggleGroupExpansion(group.id)}
                  />
                ))}

                <Button
                  type="button"
                  onClick={() => addSymptomGroup(partId)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Symptom Group
                </Button>
              </div>
            </Section>
          );
        })}
      </div>
    </div>
  );
}