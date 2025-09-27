import React, { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { calculateAge } from '../lib/utils';
import { Button } from './ui/Button';
import { PatientForm } from '../types/index';
import { X, Copy, Printer } from 'lucide-react';

interface FullNarrativeSummaryProps {
  onClose: () => void;
}

export function FullNarrativeSummary({ onClose }: FullNarrativeSummaryProps) {
  const { getValues, watch } = useFormContext<PatientForm>();
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Get all form data
  const formData = getValues();
  const demographics = watch('demographics') || {};
  const problems = watch('problems') || {};
  const timeline = watch('timeline') || [];
  const observations = watch('observations') || {};
  const rangeOfMotion = watch('rangeOfMotion') || {};
  const strengthTesting = watch('strengthTesting') || {};
  const specialTestsData = watch('specialTests') || {};
  const functionalTesting = watch('functionalTesting') || {};
  const selectedParts = watch('selectedParts') || [];

  // Helper functions
  const getPatientName = () => {
    const { prefix, prefixOther, firstName, middleName, lastName, suffix, suffixOther } = demographics;
    const prefixText = prefix === 'Other' ? prefixOther : prefix;
    const suffixText = suffix === 'Other' ? suffixOther : suffix;
    return [prefixText, firstName, middleName, lastName, suffixText].filter(Boolean).join(' ');
  };

  const getBodyPartName = (bodyPartId: string) => {
    const bodyPartMap: { [key: string]: string } = {
      'cervicalSpine': 'cervical spine',
      'thoracicSpine': 'thoracic spine',
      'lumbarSpine': 'lumbar spine',
      'shoulder': 'shoulder',
      'upperArm': 'upper arm',
      'elbow': 'elbow',
      'forearm': 'forearm',
      'wrist': 'wrist',
      'hip': 'hip',
      'thigh': 'thigh',
      'knee': 'knee',
      'shin': 'shin',
      'ankle': 'ankle',
      'foot': 'foot',
      'hand': 'hand',
      'neck': 'neck'
    };
    return bodyPartMap[bodyPartId] || (typeof bodyPartId === 'string' ? bodyPartId.replace(/([A-Z])/g, ' $1').toLowerCase() : bodyPartId);
  };

  // Generate the intro paragraph (preserve existing logic)
  const generateIntroNarrative = () => {
    const patientName = getPatientName();
    const firstName = demographics?.firstName || '';
    const age = demographics?.dateOfBirth ? calculateAge(demographics.dateOfBirth) : '';
    const gender = demographics?.gender || '[gender]';
    const bodyType = demographics?.bodyType && demographics.bodyType.trim() !== '' ? demographics.bodyType : 'well-developed';
    const employerName = formData?.employer?.name || '';
    const isEmployed = formData?.employmentStatus === 'employed' && employerName;

    // Get sports list
    const SPORTS_OPTIONS = [
      { id: 'running', label: 'Running' }, { id: 'weightlifting', label: 'Weight Lifting' },
      { id: 'swimming', label: 'Swimming' }, { id: 'cycling', label: 'Cycling' },
      { id: 'basketball', label: 'Basketball' }, { id: 'football', label: 'Football' },
      { id: 'soccer', label: 'Soccer' }, { id: 'tennis', label: 'Tennis' },
      { id: 'golf', label: 'Golf' }, { id: 'baseball', label: 'Baseball' },
      { id: 'softball', label: 'Softball' }, { id: 'volleyball', label: 'Volleyball' },
      { id: 'hockey', label: 'Hockey' }, { id: 'martial_arts', label: 'Martial Arts' },
      { id: 'yoga', label: 'Yoga' }, { id: 'pilates', label: 'Pilates' },
      { id: 'dance', label: 'Dance' }, { id: 'hiking', label: 'Hiking' },
      { id: 'skiing', label: 'Skiing' }, { id: 'snowboarding', label: 'Snowboarding' },
      { id: 'rock_climbing', label: 'Rock Climbing' }, { id: 'crossfit', label: 'CrossFit' },
      { id: 'other', label: 'Other' }
    ];

    const sportsLabels = demographics?.sports?.map(sportId => {
      const sport = SPORTS_OPTIONS.find(s => s.id === sportId);
      return sport ? sport.label : sportId;
    }) || [];

    // Get problems text
    let problemsText = 'various musculoskeletal complaints';
    const problemsList = Object.keys(problems).map(bodyPartId => ({
      id: bodyPartId,
      bodyPart: bodyPartId,
      symptomGroups: problems[bodyPartId]?.symptomGroups || []
    }));

    if (problemsList.length > 0) {
      const problemDescriptions = [];
      for (const problem of problemsList) {
        if (problem.symptomGroups && problem.symptomGroups.length > 0) {
          for (const group of problem.symptomGroups) {
            const bodyPartName = getBodyPartName(problem.bodyPart);
            let description = bodyPartName;
            
            if (group.location && Array.isArray(group.location) && group.location.length > 0) {
              description = `${group.location.join('/')} ${description}`;
            }
            
            if (group.side && group.side !== '') {
              description = `${group.side} ${description}`;
            }
            
            if (group.symptoms && Array.isArray(group.symptoms) && group.symptoms.length > 0) {
              description += ` ${group.symptoms.join(', ')}`;
            } else {
              description += ' discomfort';
            }
            
            problemDescriptions.push(description);
          }
        } else {
          const bodyPartName = getBodyPartName(problem.bodyPart);
          problemDescriptions.push(`${bodyPartName} discomfort`);
        }
      }
      
      if (problemDescriptions.length > 0) {
        problemsText = problemDescriptions.join(', ');
      }
    }

    let narrative = `Thank you for the referral of ${patientName} who, as you know, is a ${age} y.o., ${bodyType} ${gender}`;
    
    if (isEmployed) {
      narrative += ` who is employed at ${employerName}`;
    }
    
    if (sportsLabels.length > 0) {
      narrative += ` and who participates in ${sportsLabels.join(', ')}`;
    }
    
    narrative += '.\n\n';
    narrative += `${firstName} initially presented with complaint(s) of ${problemsText} and presented with the following findings.`;
    
    return narrative;
  };

  // Generate timeline narrative
  const generateTimelineNarrative = () => {
    if (!timeline || !Array.isArray(timeline) || timeline.length === 0) return '';

    const eventTypeMapping = {
      'initialInjury': 'Initial Injury',
      'mdVisit': 'MD Visit',
      'dxImaging': 'Diagnostic Imaging',
      'medication': 'Medication',
      'rehabVisit': 'Rehabilitation Visit',
      'rehabilitationVisit': 'Rehabilitation Visit',
      'other': 'Other'
    };

    let narrative = '\n\n**Problem Timeline:**\n\n';
    
    // Sort timeline events by date
    const sortedEvents = [...timeline].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    sortedEvents.forEach((event, index) => {
      const date = event.date ? format(parseISO(event.date), 'MMMM dd, yyyy') : 'Date not specified';
      
      let eventTypes = 'Unknown event';
      if (event.eventType) {
        if (Array.isArray(event.eventType)) {
          const labels = event.eventType
            .filter(id => typeof id === 'string' && id.length > 1)
            .map(id => eventTypeMapping[id] || id)
            .filter(Boolean);
          if (labels.includes('Other') && event.eventTypeOther) {
            const idx = labels.indexOf('Other');
            labels[idx] = event.eventTypeOther;
          }
          eventTypes = labels.join(', ');
        } else if (typeof event.eventType === 'string') {
          eventTypes = eventTypeMapping[event.eventType] || event.eventType;
        }
      }

      let bodyPartsText = '';
      if (event.bodyParts && Array.isArray(event.bodyParts) && event.bodyParts.length > 0) {
        bodyPartsText = ` affecting the ${event.bodyParts.join(', ')}`;
      }

      let description = '';
      if (event.description && event.description.trim() !== '') {
        description = `. ${event.description}`;
      }

      narrative += `On ${date}, the patient experienced ${eventTypes.toLowerCase()}${bodyPartsText}${description}.\n\n`;
    });

    return narrative;
  };

  // Generate observations narrative  
  const generateObservationsNarrative = () => {
    if (!observations || Object.keys(observations).length === 0) return '';

    let narrative = '\n\n**Clinical Observations:**\n\n';
    const sections = [];

    if (observations.posture?.includeInSummary && observations.posture?.assessment) {
      sections.push(`Posture was assessed as ${observations.posture.assessment}${observations.posture.notes ? `. ${observations.posture.notes}` : '.'}`);
    }

    if (observations.gait?.includeInSummary && observations.gait?.assessment) {
      sections.push(`Gait pattern was ${observations.gait.assessment}${observations.gait.notes ? `. ${observations.gait.notes}` : '.'}`);
    }

    if (observations.skinIntegumentary?.includeInSummary) {
      let skinText = 'Skin and integumentary system';
      if (observations.skinIntegumentary.assessment) {
        skinText += ` was ${observations.skinIntegumentary.assessment}`;
      }
      if (observations.skinIntegumentary.notes) {
        skinText += `. ${observations.skinIntegumentary.notes}`;
      }
      if (observations.skinIntegumentary.wounds && observations.skinIntegumentary.wounds.length > 0) {
        const woundDescriptions = observations.skinIntegumentary.wounds.map((wound, index) => {
          let desc = `wound ${index + 1}`;
          if (wound.location) desc += ` located at ${wound.location}`;
          if (wound.type) desc += ` (${wound.type})`;
          if (wound.length || wound.width || wound.depth) {
            const dimensions = [wound.length && `${wound.length}cm L`, wound.width && `${wound.width}cm W`, wound.depth && `${wound.depth}cm D`].filter(Boolean);
            if (dimensions.length > 0) desc += ` measuring ${dimensions.join(' × ')}`;
          }
          return desc;
        });
        skinText += `. Notable wounds include: ${woundDescriptions.join(', ')}`;
      }
      sections.push(skinText + '.');
    }

    if (observations.assistiveDevices?.includeInSummary) {
      if (observations.assistiveDevices.devices && observations.assistiveDevices.devices.length > 0) {
        sections.push(`The patient uses the following assistive devices: ${observations.assistiveDevices.devices.join(', ')}${observations.assistiveDevices.notes ? `. ${observations.assistiveDevices.notes}` : '.'}.`);
      } else {
        sections.push(`No assistive devices were noted${observations.assistiveDevices.notes ? `. ${observations.assistiveDevices.notes}` : '.'}.`);
      }
    }

    if (observations.generalAppearance?.includeInSummary && observations.generalAppearance?.assessment) {
      const appearance = Array.isArray(observations.generalAppearance.assessment) 
        ? observations.generalAppearance.assessment.map(item => typeof item === 'string' ? item.replace(/_/g, ' ') : item).join(', ')
        : observations.generalAppearance.assessment;
      sections.push(`General appearance and behavior were characterized as ${appearance}${observations.generalAppearance.notes ? `. ${observations.generalAppearance.notes}` : '.'}.`);
    }

    if (observations.bodyType?.includeInSummary && observations.bodyType?.assessment) {
      sections.push(`General body type was assessed as ${observations.bodyType.assessment}${observations.bodyType.notes ? `. ${observations.bodyType.notes}` : '.'}.`);
    }

    if (sections.length === 0) return '';

    narrative += sections.join(' ');
    return narrative;
  };

  // Generate ROM narrative with progress tracking
  const generateROMNarrative = () => {
    if (!rangeOfMotion || Object.keys(rangeOfMotion).length === 0) return '';

    let narrative = '\n\n**Range of Motion Assessment:**\n\n';
    const findings = [];

    Object.entries(rangeOfMotion).forEach(([bodyPart, measurements]) => {
      if (!measurements) return;
      
      const bodyPartName = getBodyPartName(bodyPart);
      const bodyPartFindings = [];

      Object.entries(measurements).forEach(([motion, values]) => {
        if (!values) return;
        
        const motionName = motion.replace(/([A-Z])/g, ' $1').toLowerCase();
        const measurements = [];

        // Format current measurements
        if (values.active) {
          if (typeof values.active === 'object') {
            if (values.active.left) measurements.push(`left active ${motionName}: ${values.active.left}°`);
            if (values.active.right) measurements.push(`right active ${motionName}: ${values.active.right}°`);
            if (values.active.value) measurements.push(`active ${motionName}: ${values.active.value}°`);
          }
        }

        if (values.passive) {
          if (typeof values.passive === 'object') {
            if (values.passive.left) measurements.push(`left passive ${motionName}: ${values.passive.left}°`);
            if (values.passive.right) measurements.push(`right passive ${motionName}: ${values.passive.right}°`);
            if (values.passive.value) measurements.push(`passive ${motionName}: ${values.passive.value}°`);
          }
        }

        if (measurements.length > 0) {
          bodyPartFindings.push(measurements.join(', '));
        }
      });

      if (bodyPartFindings.length > 0) {
        findings.push(`${bodyPartName}: ${bodyPartFindings.join('; ')}.`);
      }
    });

    if (findings.length === 0) return '';

    narrative += `Range of motion testing revealed the following: ${findings.join(' ')}`;
    return narrative;
  };

  // Generate strength narrative (exclude equal bilateral measures) with progress tracking
  const generateStrengthNarrative = () => {
    if (!strengthTesting || Object.keys(strengthTesting).length === 0) return '';

    let narrative = '\n\n**Strength Testing:**\n\n';
    const findings = [];

    Object.entries(strengthTesting).forEach(([bodyPart, movements]) => {
      if (!movements) return;
      
      const bodyPartName = getBodyPartName(bodyPart);
      const strengthFindings = [];

      Object.entries(movements).forEach(([movement, values]) => {
        if (!values || typeof values !== 'object') return;
        
        const movementName = movement.replace(/([A-Z])/g, ' $1').toLowerCase();
        const measurements = [];

        const formatStrengthValue = (value, testType = 'manual') => {
          switch (testType) {
            case 'manual':
              return `${value}/5 (MMT)`;
            case 'strain_gauge':
              return `${value} lbs (SG)`;
            case 'isokinetic':
              return `${value} Nm (ISO)`;
            case 'percent_rm':
              return `${value}% (RM)`;
            default:
              return `${value}/5 (MMT)`;
          }
        };

        // Only include bilateral measures if they're different, or if only one side has data
        if (values.left && values.right) {
          if (values.left !== values.right) {
            measurements.push(`left ${movementName}: ${formatStrengthValue(values.left, values.testType)}`);
            measurements.push(`right ${movementName}: ${formatStrengthValue(values.right, values.testType)}`);
          }
        } else {
          if (values.left) measurements.push(`left ${movementName}: ${formatStrengthValue(values.left, values.testType)}`);
          if (values.right) measurements.push(`right ${movementName}: ${formatStrengthValue(values.right, values.testType)}`);
        }
        if (values.value) measurements.push(`${movementName}: ${formatStrengthValue(values.value, values.testType)}`);

        if (measurements.length > 0) {
          strengthFindings.push(measurements.join(', '));
        }
      });

      if (strengthFindings.length > 0) {
        findings.push(`${bodyPartName}: ${strengthFindings.join('; ')}.`);
      }
    });

    if (findings.length === 0) return '';

    narrative += `Manual muscle testing demonstrated: ${findings.join(' ')}`;
    return narrative;
  };

  // Generate special tests narrative
  const generateSpecialTestsNarrative = () => {
    if (!specialTestsData || Object.keys(specialTestsData).length === 0) return '';

    let narrative = '\n\n**Special Tests:**\n\n';
    const findings = [];

    Object.entries(specialTestsData).forEach(([bodyPart, tests]: [string, any]) => {
      if (!tests) return;
      
      const bodyPartName = getBodyPartName(bodyPart);
      const testFindings = [];

      Object.entries(tests).forEach(([testId, testData]: [string, any]) => {
        if (!testData || typeof testData !== 'object') return;
        
        const testName = testId.replace(/([A-Z])/g, ' $1').toLowerCase();
        const results = [];

        if (testData.left) results.push(`left ${testName}: ${testData.left}`);
        if (testData.right) results.push(`right ${testName}: ${testData.right}`);
        if (testData.result) results.push(`${testName}: ${testData.result}`);
        
        if (testData.notes && testData.notes.trim() !== '') {
          if (results.length > 0) {
            results[results.length - 1] += ` (${testData.notes})`;
          } else {
            results.push(`${testName}: ${testData.notes}`);
          }
        }

        if (results.length > 0) {
          testFindings.push(results.join(', '));
        }
      });

      if (testFindings.length > 0) {
        findings.push(`${bodyPartName}: ${testFindings.join('; ')}.`);
      }
    });

    if (findings.length === 0) return '';

    narrative += `Special testing revealed: ${findings.join(' ')}`;
    return narrative;
  };

  // Generate complete narrative
  const generateFullNarrative = () => {
    let fullNarrative = generateIntroNarrative();
    fullNarrative += generateTimelineNarrative();
    fullNarrative += generateObservationsNarrative();
    fullNarrative += generateROMNarrative();
    fullNarrative += generateStrengthNarrative();
    fullNarrative += generateSpecialTestsNarrative();
    
    return fullNarrative;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateFullNarrative());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Full Narrative Summary - ${getPatientName()}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                h1 { text-align: center; margin-bottom: 30px; }
                .content { white-space: pre-wrap; }
                .date { text-align: center; color: #666; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <h1>Full Narrative Evaluation Summary</h1>
              <div class="date">Generated on ${format(new Date(), 'MM/dd/yyyy')}</div>
              <div class="content">${generateFullNarrative()}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-8 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Full Narrative Summary</h2>
          <div className="flex gap-2">
            <Button 
              onClick={handleCopy} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button 
              onClick={handlePrint} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={onClose} variant="outline" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div ref={printRef} className="bg-white p-6 rounded-lg border">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {generateFullNarrative()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
