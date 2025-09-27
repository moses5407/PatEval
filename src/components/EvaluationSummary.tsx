import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { calculateAge } from '../lib/utils';
import { Button } from './ui/Button';
import { specialTests, jointROM, strengthTests } from '../lib/constants';
import { PatientForm } from '../types/index';
import { getPatientEvaluations } from '../lib/dataAccess';

interface EvaluationSummaryProps {
  onClose: () => void;
  patientId?: string | null;
  currentEvaluationDate?: string;
}

interface ClinicalNotes {
  clinicalCarePath: string;
  issuesIdentified: string;
  suggestedPlan: string;
}

interface HistoricalEvaluation {
  id: string;
  evaluationDate: string;
  rangeOfMotion: any;
  specialTests: any;
  strengthTesting: any;
}

export function EvaluationSummary({ onClose, patientId, currentEvaluationDate }: EvaluationSummaryProps) {
  const { watch, getValues } = useFormContext<PatientForm>();
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNotes>({
    clinicalCarePath: '',
    issuesIdentified: '',
    suggestedPlan: ''
  });
  const [historicalData, setHistoricalData] = useState<HistoricalEvaluation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  // Clear render error on mount
  useEffect(() => {
    setRenderError(null);
    setDataLoadError(null);
  }, []);

  // Add error boundary logic
  const handleRenderError = (error: Error) => {
    console.error('EvaluationSummary render error:', error);
    setRenderError(error.message);
  };

  // Safe data access with logging and fallbacks
  const safeWatch = (path: string, fallback: any = {}) => {
    try {
      const data = watch(path as any);
      if (data === undefined || data === null) {
        console.warn(`EvaluationSummary: No data found for path '${path}', using fallback:`, fallback);
        return fallback;
      }
      return data;
    } catch (error) {
      console.error(`EvaluationSummary: Error watching path '${path}':`, error);
      return fallback;
    }
  };

  // Safe form values access
  const safeGetValues = () => {
    try {
      const allValues = getValues();
      console.log('EvaluationSummary: Current form values:', allValues);
      return allValues;
    } catch (error) {
      console.error('EvaluationSummary: Error getting form values:', error);
      setDataLoadError('Unable to access evaluation data');
      return null;
    }
  };

  // Watch form data reactively with safe access
  const formData = safeGetValues();
  const demographics = safeWatch('demographics', {});
  const emergencyContact = safeWatch('emergencyContact', {});
  const employer = safeWatch('employer', {});
  const observations = safeWatch('observations', {
    posture: { assessment: '', notes: '', includeInSummary: false },
    gait: { assessment: '', notes: '', includeInSummary: false },
    skinIntegumentary: { assessment: '', notes: '', includeInSummary: false },
    assistiveDevices: { devices: [], notes: '', includeInSummary: false },
    generalAppearance: { assessment: [], notes: '', includeInSummary: false },
    bodyType: { assessment: '', notes: '', includeInSummary: false }
  });
  const functionalTesting = safeWatch('functionalTesting', {
    upperQuarter: {},
    lowerQuarter: {},
    wholeBody: {}
  });
  const summaryInclusion = safeWatch('summaryInclusion', {
    demographics: true,
    employer: false,
    emergencyContact: false,
    observations: true,
    problems: true,
    timeline: true,
    rangeOfMotion: true,
    specialTests: true,
    strengthTesting: true,
    functionalTesting: true,
    narrative: false
  });
  const timeline = safeWatch('timeline', []);
  
  // Debug timeline data
  useEffect(() => {
    console.log('EvaluationSummary - Timeline data:', timeline);
    console.log('EvaluationSummary - Timeline length:', timeline?.length);
    console.log('EvaluationSummary - Timeline is array:', Array.isArray(timeline));
  }, [timeline]);
  const rangeOfMotion = safeWatch('rangeOfMotion', {});
  const specialTestsData = safeWatch('specialTests', {});
  const strengthTesting = safeWatch('strengthTesting', {});
  const selectedParts = safeWatch('selectedParts', []);
  const problemsData = safeWatch('problems', {});
  
  // Convert problems object to array format for consistent processing with error handling
  let problems = [];
  try {
    if (problemsData && typeof problemsData === 'object') {
      problems = Object.keys(problemsData).map(bodyPartId => ({
        id: bodyPartId,
        bodyPart: bodyPartId,
        symptomGroups: problemsData[bodyPartId]?.symptomGroups || []
      }));
    }
  } catch (error) {
    console.error('Error processing problems data:', error);
    problems = [];
  }

  // Add data validation check
  const validateEvaluationData = () => {
    if (!formData) {
      setDataLoadError('No evaluation data available');
      return false;
    }
    if (!demographics || (!demographics.firstName && !demographics.lastName)) {
      setDataLoadError('Patient demographics missing or incomplete');
      return false;
    }
    return true;
  };

  // Early data validation
  useEffect(() => {
    const isValid = validateEvaluationData();
    if (!isValid) {
      console.warn('EvaluationSummary: Invalid evaluation data detected');
    }
  }, [formData, demographics]);

  // Load historical data when component mounts or when evaluation date changes
  useEffect(() => {
    if (patientId) {
      loadHistoricalData();
    }
  }, [patientId, currentEvaluationDate, formData?.evaluationDate]);

  const loadHistoricalData = async () => {
    if (!patientId) return;
    
    try {
      setLoadingHistory(true);
      const evaluations = await getPatientEvaluations(patientId);
      
      // Filter to only include evaluations up to and including current date
      const currentDate = currentEvaluationDate || formData?.evaluationDate;
      const relevantEvaluations = evaluations.filter(evaluation => 
        evaluation.evaluationDate <= currentDate
      ).map(evaluation => ({
        id: evaluation.id,
        evaluationDate: evaluation.evaluationDate,
        rangeOfMotion: evaluation.rangeOfMotion || {},
        specialTests: evaluation.specialTests || {},
        strengthTesting: evaluation.strengthTesting || {}
      }));
      
      // Add current evaluation data if it's not already in the historical data
      if (currentDate && formData && Array.isArray(relevantEvaluations)) {
        const currentEvalExists = relevantEvaluations.some(evaluation => evaluation.evaluationDate === currentDate);
        if (!currentEvalExists) {
          // Include current evaluation data in the summary
          relevantEvaluations.push({
            id: 'current',
            evaluationDate: currentDate,
            rangeOfMotion: formData.rangeOfMotion || {},
            specialTests: formData.specialTests || {},
            strengthTesting: formData.strengthTesting || {}
          });
          // Sort by date to maintain chronological order
          relevantEvaluations.sort((a, b) => a.evaluationDate.localeCompare(b.evaluationDate));
        }
      }
      
      setHistoricalData(relevantEvaluations);
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Helper functions with error handling
  const getPatientName = () => {
    if (!demographics) return 'Unknown Patient';
    const { prefix, prefixOther, firstName, middleName, lastName, suffix, suffixOther } = demographics;
    const prefixText = prefix === 'Other' ? prefixOther : prefix;
    const suffixText = suffix === 'Other' ? suffixOther : suffix;
    return [prefixText, firstName, middleName, lastName, suffixText].filter(Boolean).join(' ');
  };

  const getEmergencyContactName = () => {
    if (!emergencyContact) return '';
    return `${emergencyContact.firstName || ''} ${emergencyContact.lastName || ''}`.trim();
  };

  const getEmergencyContactRelation = () => {
    if (!emergencyContact) return '';
    return emergencyContact.relationship === 'other' 
      ? emergencyContact.relationshipOther || ''
      : emergencyContact.relationship || '';
  };

  const getEmployerInfo = () => {
    if (!employer) return { name: '', address: '', phone: '' };
    const address = [employer.streetAddress, employer.city, employer.state, employer.zipCode]
      .filter(Boolean)
      .join(', ');
    return {
      name: employer.name || '',
      address,
      phone: employer.phone || ''
    };
  };

  // Generate narrative paragraph with error handling
  const generateNarrative = () => {
    try {
      const patientName = getPatientName();
      const firstName = demographics?.firstName || '';
      const age = demographics?.dateOfBirth ? calculateAge(demographics.dateOfBirth) : '';
      const gender = demographics?.gender || '[gender]';
      
      // Handle body type with better fallback
      const bodyType = demographics?.bodyType && demographics.bodyType.trim() !== '' 
        ? demographics.bodyType 
        : 'well-developed';
      
      const employerName = getEmployerInfo().name;
      const isEmployed = formData?.employmentStatus === 'employed' && employerName;
      
      // Get sports list from demographics
      const sportsLabels = demographics?.sports?.map(sportId => {
        const sport = SPORTS_OPTIONS.find(s => s.id === sportId);
        return sport ? sport.label : sportId;
      }) || [];
      
      // Get problems text from the converted problems array - IMPROVED LOGIC
      let problemsText = 'various musculoskeletal complaints'; // fallback
      
      if (problems && problems.length > 0) {
        const problemDescriptions = [];
        
        for (const problem of problems) {
          if (problem.symptomGroups && problem.symptomGroups.length > 0) {
            for (const group of problem.symptomGroups) {
              const bodyPartName = getBodyPartName(problem.bodyPart);
              
              // Build description based on available data
              let description = bodyPartName;
              
              // Add location if specified
              if (group.location && Array.isArray(group.location) && group.location.length > 0) {
                description = `${group.location.join('/')} ${description}`;
              }
              
              // Add side if specified
              if (group.side && group.side !== '') {
                description = `${group.side} ${description}`;
              }
              
              // Add symptoms if any are selected
              if (group.symptoms && Array.isArray(group.symptoms) && group.symptoms.length > 0) {
                description += ` ${group.symptoms.join(', ')}`;
              } else {
                // Fallback to "discomfort" if no specific symptoms
                description += ' discomfort';
              }
              
              problemDescriptions.push(description);
            }
          } else {
            // If no symptom groups, just use body part name + discomfort
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
    } catch (error) {
      console.error('Error generating narrative:', error);
      return 'Unable to generate narrative due to missing data.';
    }
  };
  
  // Helper function to convert bodyPart IDs to readable names
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

  // Sports options for narrative generation
  const SPORTS_OPTIONS = [
    { id: 'running', label: 'Running' },
    { id: 'weightlifting', label: 'Weight Lifting' },
    { id: 'swimming', label: 'Swimming' },
    { id: 'cycling', label: 'Cycling' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'football', label: 'Football' },
    { id: 'soccer', label: 'Soccer' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'golf', label: 'Golf' },
    { id: 'baseball', label: 'Baseball' },
    { id: 'softball', label: 'Softball' },
    { id: 'volleyball', label: 'Volleyball' },
    { id: 'hockey', label: 'Hockey' },
    { id: 'martial_arts', label: 'Martial Arts' },
    { id: 'yoga', label: 'Yoga' },
    { id: 'pilates', label: 'Pilates' },
    { id: 'dance', label: 'Dance' },
    { id: 'hiking', label: 'Hiking' },
    { id: 'skiing', label: 'Skiing' },
    { id: 'snowboarding', label: 'Snowboarding' },
    { id: 'rock_climbing', label: 'Rock Climbing' },
    { id: 'crossfit', label: 'CrossFit' },
    { id: 'other', label: 'Other' }
  ];

  const getOnsetDate = () => {
    try {
      // Get the earliest onset date from timeline or problems
      const timelineDates = timeline?.map((event: any) => event.date).filter(Boolean) || [];
      if (timelineDates.length > 0) {
        const earliestDate = timelineDates.sort()[0];
        return format(parseISO(earliestDate), 'MM/dd/yyyy');
      }
      return '';
    } catch (error) {
      console.error('Error getting onset date:', error);
      return '';
    }
  };

  const getInitialVisitDate = () => {
    try {
      // This would typically be the first evaluation date for this patient
      if (historicalData.length > 0) {
        const sortedDates = historicalData.map(evaluation => evaluation.evaluationDate).sort();
        return format(parseISO(sortedDates[0]), 'MM/dd/yyyy');
      }
      return formData?.evaluationDate ? format(parseISO(formData.evaluationDate), 'MM/dd/yyyy') : '';
    } catch (error) {
      console.error('Error getting initial visit date:', error);
      return '';
    }
  };

  const getVisitsSinceInitial = () => {
    return Math.max(1, historicalData.length);
  };

  // Smart date column management
  const getSmartDateColumns = (allDates: string[], maxColumns: number = 5) => {
    if (allDates.length <= maxColumns) {
      return allDates;
    }
    
    const sortedDates = [...allDates].sort();
    const result = [];
    
    // Always include first and last
    result.push(sortedDates[0]);
    
    // Add 1-2 intervening dates based on available space
    const remaining = maxColumns - 2;
    if (remaining > 0) {
      const step = Math.max(1, Math.floor((sortedDates.length - 2) / remaining));
      for (let i = step; i < sortedDates.length - 1; i += step) {
        if (result.length < maxColumns - 1) {
          result.push(sortedDates[i]);
        }
      }
    }
    
    // Always include last if not already included
    if (result[result.length - 1] !== sortedDates[sortedDates.length - 1]) {
      result.push(sortedDates[sortedDates.length - 1]);
    }
    
    return result;
  };

  const getHistoricalROMFindings = () => {
    try {
      const findings: any[] = [];
      const allDates = new Set<string>();
      
      // Collect current data
      const currentDate = formData?.evaluationDate;
      if (currentDate) {
        allDates.add(currentDate);
      }
      
      // Collect historical dates where there are ROM findings
      historicalData.forEach(evaluation => {
        if (Object.keys(evaluation.rangeOfMotion || {}).length > 0) {
          allDates.add(evaluation.evaluationDate);
        }
      });
      
      const dates = getSmartDateColumns(Array.from(allDates));
      
      // Build findings with historical context
      Object.entries(rangeOfMotion || {}).forEach(([bodyPart, measurements]: [string, any]) => {
        const romData = jointROM[bodyPart as keyof typeof jointROM];
        if (!romData || !measurements) return;

        Object.entries(measurements).forEach(([motion, values]: [string, any]) => {
          if (!values) return;
          const normalRange = romData[motion]?.max;
          if (!normalRange) return;

          const checkValue = (value: number, side: string, currentOnly: boolean = false) => {
            // Show ALL entered ROM values, not just abnormal ones
            if (value && value > 0) {
              const historicalValues: { [date: string]: number } = {};
              
              // Add current value
              if (currentDate) {
                historicalValues[currentDate] = value;
              }
              
              // Add historical values if not current only
              if (!currentOnly) {
                historicalData.forEach(evaluation => {
                  const evalData = evaluation.rangeOfMotion?.[bodyPart]?.[motion];
                  if (evalData) {
                    if (side.includes('left active') && evalData.active?.left) {
                      historicalValues[evaluation.evaluationDate] = evalData.active.left;
                    } else if (side.includes('right active') && evalData.active?.right) {
                      historicalValues[evaluation.evaluationDate] = evalData.active.right;
                    } else if (side.includes('left passive') && evalData.passive?.left) {
                      historicalValues[evaluation.evaluationDate] = evalData.passive.left;
                    } else if (side.includes('right passive') && evalData.passive?.right) {
                      historicalValues[evaluation.evaluationDate] = evalData.passive.right;
                    } else if (side === 'active' && evalData.active?.value) {
                      historicalValues[evaluation.evaluationDate] = evalData.active.value;
                    } else if (side === 'passive' && evalData.passive?.value) {
                      historicalValues[evaluation.evaluationDate] = evalData.passive.value;
                    }
                  }
                });
              }
              
              findings.push({
                bodyPart: typeof bodyPart === 'string' ? bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase() : bodyPart,
                motion: typeof motion === 'string' ? motion.replace(/([A-Z])/g, ' $1').toLowerCase() : motion,
                side,
                normal: normalRange,
                historicalValues,
                dates,
                type: 'ROM'
              });
            }
          };

          if (typeof values.active === 'object' && values.active) {
            if (values.active.left) checkValue(values.active.left, 'left active');
            if (values.active.right) checkValue(values.active.right, 'right active');
            if (values.active.value) checkValue(values.active.value, 'active');
          }
          
          if (typeof values.passive === 'object' && values.passive) {
            if (values.passive.left) checkValue(values.passive.left, 'left passive');
            if (values.passive.right) checkValue(values.passive.right, 'right passive');
            if (values.passive.value) checkValue(values.passive.value, 'passive');
          }
        });
      });
      
      return findings;
    } catch (error) {
      console.error('Error getting ROM findings:', error);
      return [];
    }
  };

  const getHistoricalSpecialTests = () => {
    try {
      const findings: any[] = [];
      const allDates = new Set<string>();
      
      // Collect current data
      const currentDate = formData?.evaluationDate;
      if (currentDate) {
        allDates.add(currentDate);
      }
      
      // Collect historical dates with special test data
      historicalData.forEach(evaluation => {
        if (Object.keys(evaluation.specialTests || {}).length > 0) {
          allDates.add(evaluation.evaluationDate);
        }
      });
      
      const dates = getSmartDateColumns(Array.from(allDates));
      
      Object.entries(specialTestsData || {}).forEach(([bodyPart, tests]: [string, any]) => {
        if (!tests) return;
        Object.entries(tests).forEach(([testId, testData]: [string, any]) => {
          if (!testData) return;
          
          const testInfo = specialTests[bodyPart as keyof typeof specialTests]?.tests[testId];
          if (!testInfo) return;

          // Check for positive results and build historical context
          const checkResult = (result: string, side: string) => {
            if (result === 'positive') {
              const historicalValues: { [date: string]: string } = {};
              if (currentDate) {
                historicalValues[currentDate] = result;
              }
              
              // Add historical values
              historicalData.forEach(evaluation => {
                const evalTest = evaluation.specialTests?.[bodyPart]?.[testId];
                if (evalTest) {
                  const historicalResult = side ? evalTest[side] : evalTest.result;
                  if (historicalResult) {
                    historicalValues[evaluation.evaluationDate] = historicalResult;
                  }
                }
              });
              
              findings.push({
                bodyPart: typeof bodyPart === 'string' ? bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase() : bodyPart,
                test: testInfo.name,
                side: side || '',
                notes: testData.notes || '',
                historicalValues,
                dates,
                type: 'Special Test'
              });
            }
          };
          
          if (testData.left) checkResult(testData.left, 'left');
          if (testData.right) checkResult(testData.right, 'right');
          if (testData.result) checkResult(testData.result, '');
        });
      });
      
      return findings;
    } catch (error) {
      console.error('Error getting special test findings:', error);
      return [];
    }
  };

  const getHistoricalStrengthFindings = () => {
    try {
      const findings: any[] = [];
      const allDates = new Set<string>();
      
      // Collect current data
      const currentDate = formData?.evaluationDate;
      if (currentDate) {
        allDates.add(currentDate);
      }
      
      // Collect historical dates with strength data
      historicalData.forEach(evaluation => {
        if (Object.keys(evaluation.strengthTesting || {}).length > 0) {
          allDates.add(evaluation.evaluationDate);
        }
      });
      
      const dates = getSmartDateColumns(Array.from(allDates));
      
      // Iterate through body parts and movements
      Object.entries(strengthTesting || {}).forEach(([bodyPart, movements]: [string, any]) => {
        if (!movements) return;
        
        // Handle nested movements within each body part
        Object.entries(movements).forEach(([movement, values]: [string, any]) => {
          if (!values) return;

          const checkStrengthValue = (value: number, side: string) => {
            // Show ALL entered strength values, not just those <= 4
            if (value && value > 0) {
              const historicalValues: { [date: string]: number } = {};
              if (currentDate) {
                historicalValues[currentDate] = value;
              }
              
              // Add historical values
              historicalData.forEach(evaluation => {
                const evalStrength = evaluation.strengthTesting?.[bodyPart]?.[movement];
                if (evalStrength) {
                  const historicalValue = side ? evalStrength[side] : evalStrength.value;
                  if (historicalValue) {
                    historicalValues[evaluation.evaluationDate] = historicalValue;
                  }
                }
              });
              
              findings.push({
                bodyPart: typeof bodyPart === 'string' ? bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase() : bodyPart,
                movement: typeof movement === 'string' ? movement.replace(/([A-Z])/g, ' $1').toLowerCase() : movement,
                side,
                notes: values.notes || '',
                historicalValues,
                dates,
                type: 'Strength',
                testType: values.testType || 'manual'
              });
            }
          };

          if (values.left) checkStrengthValue(values.left, 'left');
          if (values.right) checkStrengthValue(values.right, 'right');
          if (values.value) checkStrengthValue(values.value, '');
        });
      });
      
      return findings;
    } catch (error) {
      console.error('Error getting strength findings:', error);
      return [];
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Patient Evaluation Summary</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                h1 { text-align: center; }
                h3 { border-bottom: 2px solid #ccc; padding-bottom: 5px; }
                h4 { font-weight: 600; margin-bottom: 8px; }
                .capitalize { text-transform: capitalize; }
                .text-red-600 { color: #dc2626; }
                .text-green-600 { color: #059669; }
                .text-gray-400 { color: #9ca3af; }
                .text-gray-700 { color: #374151; }
                .text-gray-800 { color: #1f2937; }
                .font-medium { font-weight: 500; }
                .font-semibold { font-weight: 600; }
                .text-center { text-align: center; }
                .text-sm { font-size: 14px; }
                .text-xs { font-size: 12px; }
                .text-base { font-size: 16px; }
                .min-w-16 { min-width: 64px; }
                .space-y-1 > * + * { margin-top: 4px; }
                .space-y-8 > * + * { margin-top: 2rem; }
                .leading-relaxed { line-height: 1.625; }
                .whitespace-pre-wrap { white-space: pre-wrap; }
                .mb-2 { margin-bottom: 8px; }
                .mb-6 { margin-bottom: 24px; }
                .w-1-4 { width: 25%; }
                .flex { display: flex; }
                .gap-6 { gap: 24px; }
                .flex-shrink-0 { flex-shrink: 0; }
                .flex-1 { flex: 1; }
                .w-32 { width: 128px; }
                .h-32 { height: 128px; }
                .w-24 { width: 96px; }
                .h-24 { height: 96px; }
                .w-16 { width: 64px; }
                .h-16 { height: 64px; }
                .rounded-lg { border-radius: 8px; }
                .border-2 { border-width: 2px; }
                .border { border-width: 1px; }
                .border-gray-200 { border-color: #e5e7eb; }
                .overflow-hidden { overflow: hidden; }
                .bg-gray-50 { background-color: #f9fafb; }
                .w-full { width: 100%; }
                .h-full { height: 100%; }
                .object-cover { object-fit: cover; }
                .mt-1 { margin-top: 4px; }
                .mt-2 { margin-top: 8px; }
                .text-gray-500 { color: #6b7280; }
                /* Ensure images maintain aspect ratio and size in print */
                img { max-width: 100%; height: auto; display: block; }
                .w-20.h-20 { width: 80px !important; height: 80px !important; }
                .w-16.h-16 { width: 64px !important; height: 64px !important; }
                .w-32.h-32 { width: 128px !important; height: 128px !important; }
                /* Print-specific layout fixes */
                .space-y-1 > * + * { margin-top: 4px !important; }
                /* Wound photo positioning for print window */
                .wound-photo-screen { display: block; }
                .wound-photo-print { display: none; }
                @media print {
                  .w-18 { width: 72px !important; }
                  .h-18 { height: 72px !important; }
                  .w-16 { width: 64px !important; }
                  .h-16 { height: 64px !important; }
                  .w-32 { width: 128px !important; }
                  .h-32 { height: 128px !important; }
                  img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
                  /* Hide wound photos from assessment column in print */
                  .wound-photo-screen { display: none !important; }
                  /* Show wound photos in notes column in print */
                  .wound-photo-print { display: block !important; }
                }
                section { page-break-inside: avoid; margin-bottom: 20px; }
                /* Hide editable version, show print version */
                .clinical-notes-editable { display: none !important; }
                .clinical-notes-print { display: block !important; }
                .screen-hidden { display: block !important; }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait a bit for content to load, then print
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  // Safe calculation of findings with error handling
  let romFindings: any[] = [];
  let specialTestFindings: any[] = [];
  let strengthFindings: any[] = [];
  let smartSummaryInclusion: any = {};
  
  try {
    romFindings = getHistoricalROMFindings();
    specialTestFindings = getHistoricalSpecialTests();
    strengthFindings = getHistoricalStrengthFindings();

    // Smart inclusion: automatically include sections with significant findings
    smartSummaryInclusion = {
      ...summaryInclusion,
      rangeOfMotion: summaryInclusion?.rangeOfMotion || romFindings.length > 0,
      specialTests: summaryInclusion?.specialTests || specialTestFindings.length > 0,
      strengthTesting: summaryInclusion?.strengthTesting || strengthFindings.length > 0,
      problems: summaryInclusion?.problems || (problems && problems.length > 0),
      timeline: summaryInclusion?.timeline !== false && (timeline && Array.isArray(timeline) && timeline.length > 0),
      observations: summaryInclusion?.observations || (observations && Object.keys(observations).length > 0),
      functionalTesting: summaryInclusion?.functionalTesting || (functionalTesting && Object.keys(functionalTesting).length > 0),
      narrative: summaryInclusion?.narrative
    };
  } catch (error) {
    console.error('Error calculating summary findings:', error);
    // Use default values on error
    smartSummaryInclusion = {
      demographics: true,
      employer: false,
      emergencyContact: false,
      observations: false,
      problems: false,
      timeline: false,
      rangeOfMotion: false,
      specialTests: false,
      strengthTesting: false,
      functionalTesting: false,
      narrative: false
    };
  }

  // Add error boundary rendering at the start
  if (renderError || dataLoadError) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-8 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-600">Error Loading Summary</h2>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800 mb-2">Unable to generate evaluation summary</h3>
            <p className="text-red-700 mb-4">
              There was an error loading the evaluation data. This often happens when:
            </p>
            <ul className="list-disc list-inside text-red-700 space-y-1 mb-4">
              <li>The evaluation was saved and reloaded with incomplete data</li>
              <li>Patient demographics are missing or incomplete</li>
              <li>The form data structure doesn't match expected format</li>
              <li>There are validation errors in the current form</li>
            </ul>
            <p className="text-red-700 mb-4 font-semibold">
              Recommended solutions:
            </p>
            <ul className="list-decimal list-inside text-red-700 space-y-1 mb-4">
              <li>Ensure patient name (first and last) are filled in Demographics</li>
              <li>Check that at least one body part is selected in Problem Selection</li>
              <li>Save the evaluation again and try creating the summary</li>
              <li>If issues persist, reset the form and re-enter the data</li>
            </ul>
            <div className="bg-white p-3 rounded border mt-4">
              <p className="text-sm text-gray-600">
                <strong>Technical Details:</strong> {renderError || dataLoadError}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Form Data Available: {formData ? 'Yes' : 'No'} | 
                Demographics Available: {demographics?.firstName ? 'Yes' : 'No'} |
                Selected Parts: {selectedParts?.length || 0}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button 
              onClick={() => {
                setRenderError(null);
                setDataLoadError(null);
                // Try to re-validate
                validateEvaluationData();
              }} 
              variant="outline"
            >
              Retry
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  let summaryContent;
  try {
    summaryContent = (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        {/* Header with close and print buttons */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Patient Evaluation Summary</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
              Print Summary
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>

        {/* Printable content */}
        <div ref={printRef} className="print-content">
          {/* Print-only header */}
          <div className="print-header screen-hidden">
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
              Patient Evaluation Summary
            </h1>
            <div style={{ color: '#6b7280', marginBottom: '16px', textAlign: 'center' }}>
              Generated on {format(new Date(), 'MM/dd/yyyy')}
            </div>
          </div>

          <div className="space-y-8">
            {/* 1. Demographics Table with Photo in Fourth Column */}
            {smartSummaryInclusion.demographics && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Patient Demographics</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Basic Information</th>
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Contact Information</th>
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Additional Details</th>
                        <th className="px-3 py-2 text-left font-semibold text-sm w-1/4">Patient Photo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-3 py-2 border-r text-sm">
                          <div className="space-y-1">
                            <div><span className="font-medium">Name:</span> {getPatientName()}</div>
                            <div><span className="font-medium">DOB:</span> {demographics?.dateOfBirth ? format(parseISO(demographics.dateOfBirth), 'MM/dd/yyyy') : 'Not set'}</div>
                            <div><span className="font-medium">Age:</span> {demographics?.dateOfBirth ? calculateAge(demographics.dateOfBirth) : 'Unknown'} years</div>
                            {demographics?.gender && (
                              <div><span className="font-medium">Gender:</span> {demographics.gender}</div>
                            )}
                            {demographics?.preferredPronouns && (
                              <div><span className="font-medium">Pronouns:</span> {demographics.preferredPronouns}</div>
                            )}
                            {demographics?.bodyType && (
                              <div><span className="font-medium">Body Type:</span> {demographics.bodyType}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r text-sm">
                          <div className="space-y-1">
                            <div><span className="font-medium">Phone:</span> {demographics?.phone || 'Not provided'}</div>
                            <div><span className="font-medium">Email:</span> {demographics?.email || 'Not provided'}</div>
                            <div><span className="font-medium">Address:</span> {demographics?.address || 'Not provided'}</div>
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r text-sm">
                          <div className="space-y-1">
                            <div><span className="font-medium">Evaluation Date:</span> {formData?.evaluationDate ? format(parseISO(formData.evaluationDate), 'MM/dd/yyyy') : 'Not set'}</div>
                            <div><span className="font-medium">Initial Visit:</span> {getInitialVisitDate()}</div>
                            <div><span className="font-medium">Total Visits:</span> {getVisitsSinceInitial()}</div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <div className="flex justify-center">
                            {demographics?.photo ? (
                              <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                                <img
                                  src={demographics.photo}
                                  alt="Patient photo"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                                No Photo
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Narrative Paragraph */}
            {smartSummaryInclusion.narrative && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Referral Narrative</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                    {generateNarrative()}
                  </p>
                </div>
              </section>
            )}

            {/* 2. Emergency Contact Information */}
            {smartSummaryInclusion.emergencyContact && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Emergency Contact</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/3">Contact Name</th>
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/3">Relationship</th>
                        <th className="px-3 py-2 text-left font-semibold text-sm w-1/3">Contact Information</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-3 py-2 border-r text-sm">
                          <div><span className="font-medium">Name:</span> {getEmergencyContactName()}</div>
                        </td>
                        <td className="px-3 py-2 border-r text-sm">
                          <div><span className="font-medium">Relation:</span> {getEmergencyContactRelation()}</div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <div className="space-y-1">
                            <div><span className="font-medium">Phone:</span> {emergencyContact?.phone || ''}</div>
                            <div><span className="font-medium">Email:</span> {emergencyContact?.email || ''}</div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 3. Employer Information */}
            {smartSummaryInclusion.employer && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Employer Information</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/3">Company</th>
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/3">Address</th>
                        <th className="px-3 py-2 text-left font-semibold text-sm w-1/3">Contact & Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-3 py-2 border-r text-sm">
                          <div><span className="font-medium">Company:</span> {getEmployerInfo().name}</div>
                        </td>
                        <td className="px-3 py-2 border-r text-sm">
                          <div><span className="font-medium">Address:</span> {getEmployerInfo().address}</div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <div className="space-y-1">
                            <div><span className="font-medium">Phone:</span> {getEmployerInfo().phone}</div>
                            <div><span className="font-medium">Status:</span> {formData?.employmentStatus === 'employed' ? 'Employed' : 'Not Employed'}</div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Problem Selection */}
            {smartSummaryInclusion.problems && problems && problems.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Problem Selection</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Body Part</th>
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Location</th>
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Symptoms</th>
                        <th className="px-3 py-2 text-left font-semibold text-sm w-1/4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems.map((problem, problemIndex) => 
                        problem.symptomGroups?.map((group, groupIndex) => (
                          <tr key={`${problemIndex}-${groupIndex}`} className="border-b">
                            <td className="px-3 py-2 border-r text-sm capitalize">
                              {typeof problem.bodyPart === 'string' ? problem.bodyPart.replace(/([A-Z])/g, ' $1').toLowerCase() : problem.bodyPart}
                            </td>
                            <td className="px-3 py-2 border-r text-sm">
                              <div className="space-y-1">
                                <div>{group.location}</div>
                                <div>{group.side}{group.severity ? `, ${group.severity}/10` : ''}</div>
                              </div>
                            </td>
                            <td className="px-3 py-2 border-r text-sm">
                              {group.symptoms && group.symptoms.length > 0 ? (
                                <ul className="space-y-1">
                                  {group.symptoms.map((symptom, idx) => (
                                    <li key={idx} className="text-sm capitalize">{symptom}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-400">No symptoms listed</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {group.description || <span className="text-gray-400">No description</span>}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Problem Timeline */}
            {(() => {
              console.log('=== TIMELINE DEBUG ===');
              console.log('smartSummaryInclusion.timeline:', smartSummaryInclusion.timeline);
              console.log('timeline:', timeline);
              console.log('Array.isArray(timeline):', Array.isArray(timeline));
              console.log('timeline.length:', timeline?.length);
              console.log('Final condition result:', smartSummaryInclusion.timeline && timeline && Array.isArray(timeline) && timeline.length > 0);
              return smartSummaryInclusion.timeline && timeline && Array.isArray(timeline) && timeline.length > 0;
            })() && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Problem Timeline</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/5">Date</th>
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/5">Event Type</th>
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/5">Body Parts</th>
                        <th className="px-3 py-2 text-left font-semibold text-sm w-2/5">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeline?.map((event, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2 border-r text-sm">
                            {event?.date ? format(parseISO(event.date), 'MM/dd/yyyy') : 'Date not set'}
                          </td>
                          <td className="px-3 py-2 border-r text-sm capitalize">
                            {(() => {
                              const eventTypeMapping = {
                                'initialInjury': 'Initial Injury',
                                'mdVisit': 'MD Visit',
                                'dxImaging': 'Diagnostic Imaging', 
                                'medication': 'Medication',
                                'rehabVisit': 'Rehabilitation Visit',
                                'rehabilitationVisit': 'Rehabilitation Visit',
                                'other': 'Other'
                              };
                              
                              console.log('Timeline Event Type Debug:', {
                                eventType: event?.eventType,
                                type: typeof event?.eventType,
                                isArray: Array.isArray(event?.eventType),
                                eventTypeOther: event?.eventTypeOther
                              });
                              
                              if (!event?.eventType) return 'Unknown';
                              
                              // Handle array of event type IDs (current format)
                              if (Array.isArray(event.eventType)) {
                                const labels = event.eventType
                                  .filter(id => typeof id === 'string' && id.length > 1) // Filter out single characters
                                  .map(id => eventTypeMapping[id] || id)
                                  .filter(Boolean);
                                if (labels.includes('Other') && event?.eventTypeOther) {
                                  const index = labels.indexOf('Other');
                                  labels[index] = event.eventTypeOther;
                                }
                                return labels.length > 0 ? labels.join(', ') : 'Unknown';
                              }
                              
                              // Handle legacy string format
                              if (typeof event.eventType === 'string') {
                                if (event.eventType === 'other') {
                                  return event?.eventTypeOther || 'Other';
                                }
                                // Direct mapping first
                                if (eventTypeMapping[event.eventType]) {
                                  return eventTypeMapping[event.eventType];
                                }
                                // Fallback formatting
                                return event.eventType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                              }
                              
                              return 'Unknown';
                            })()}
                          </td>
                          <td className="px-3 py-2 border-r text-sm">
                            {event?.bodyParts && event.bodyParts.length > 0 ? (
                              <div className="capitalize">
                                {event.bodyParts.map(part => typeof part === 'string' ? part.replace(/([A-Z])/g, ' $1').toLowerCase() : part).join(', ')}
                              </div>
                            ) : (
                              <span className="text-gray-400">No body parts specified</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {event?.description || <span className="text-gray-400">No description</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Observations Section */}
            {smartSummaryInclusion.observations && observations && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Observations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Category</th>
                        <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Assessment</th>
                        <th className="px-3 py-2 text-left font-semibold text-sm w-1/2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.posture?.includeInSummary && (
                        <tr className="border-b">
                          <td className="px-3 py-2 border-r text-sm font-medium">Posture</td>
                          <td className="px-3 py-2 border-r text-sm capitalize">{observations.posture.assessment || 'Not assessed'}</td>
                          <td className="px-3 py-2 text-sm">{observations.posture.notes || 'No notes'}</td>
                        </tr>
                      )}
                      {observations.gait?.includeInSummary && (
                        <tr className="border-b">
                          <td className="px-3 py-2 border-r text-sm font-medium">Gait</td>
                          <td className="px-3 py-2 border-r text-sm capitalize">{observations.gait.assessment || 'Not assessed'}</td>
                          <td className="px-3 py-2 text-sm">{observations.gait.notes || 'No notes'}</td>
                        </tr>
                      )}
                      {observations.skinIntegumentary?.includeInSummary && (
                        <>
                          <tr className="border-b">
                            <td className="px-3 py-2 border-r text-sm font-medium">Skin/Integumentary</td>
                            <td className="px-3 py-2 border-r text-sm capitalize">{observations.skinIntegumentary.assessment || 'Not assessed'}</td>
                            <td className="px-3 py-2 text-sm">{observations.skinIntegumentary.notes || 'No notes'}</td>
                          </tr>
                          {/* Wounds Details */}
                          {observations.skinIntegumentary.wounds && observations.skinIntegumentary.wounds.length > 0 && (
                            observations.skinIntegumentary.wounds.map((wound, index) => (
                              <tr key={`wound-${index}`} className="border-b bg-gray-50">
                                <td className="px-3 py-2 border-r text-sm font-medium">Wound {index + 1}</td>
                                <td className="px-3 py-2 border-r text-sm">
                                  <div className="space-y-1">
                                    {wound.location && <div><span className="font-medium">Location:</span> {wound.location}</div>}
                                    {wound.type && <div><span className="font-medium">Type:</span> {wound.type}</div>}
                                    {(wound.length || wound.width || wound.depth) && (
                                      <div><span className="font-medium">Dimensions:</span> {[wound.length && `${wound.length}cm L`, wound.width && `${wound.width}cm W`, wound.depth && `${wound.depth}cm D`].filter(Boolean).join(' × ')}</div>
                                    )}
                                    {/* Hide wound photo from modal Assessment column - photos should only be in Notes column */}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  {/* Show wound photo in Notes column for both modal and print */}
                                  {wound.photo && (
                                    <div className="mb-3">
                                      <div className="w-20 h-20 print:w-18 print:h-18 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                                        <img
                                          src={wound.photo}
                                          alt={`Wound ${index + 1} photo`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  {/* Notes text appears underneath photo */}
                                  <div className="wound-notes-text">
                                    {wound.notes || 'No additional notes'}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </>
                      )}
                      {observations.assistiveDevices?.includeInSummary && (
                        <tr className="border-b">
                          <td className="px-3 py-2 border-r text-sm font-medium">Assistive Devices</td>
                          <td className="px-3 py-2 border-r text-sm">
                            {observations.assistiveDevices.devices?.length > 0 
                              ? observations.assistiveDevices.devices.join(', ') 
                              : 'None'}
                          </td>
                          <td className="px-3 py-2 text-sm">{observations.assistiveDevices.notes || 'No notes'}</td>
                        </tr>
                      )}
                      {observations.generalAppearance?.includeInSummary && (
                        <tr className="border-b">
                          <td className="px-3 py-2 border-r text-sm font-medium">General Appearance/Behavior</td>
                          <td className="px-3 py-2 border-r text-sm capitalize">
                            {observations.generalAppearance.assessment && Array.isArray(observations.generalAppearance.assessment) && observations.generalAppearance.assessment.length > 0
                              ? observations.generalAppearance.assessment.map(item => typeof item === 'string' ? item.replace(/_/g, ' ') : item).join(', ')
                              : 'Not assessed'}
                          </td>
                          <td className="px-3 py-2 text-sm">{observations.generalAppearance.notes || 'No notes'}</td>
                        </tr>
                      )}
                      {observations.bodyType?.includeInSummary && (
                        <tr className="border-b">
                          <td className="px-3 py-2 border-r text-sm font-medium">General Body Type</td>
                          <td className="px-3 py-2 border-r text-sm capitalize">{observations.bodyType.assessment || 'Not assessed'}</td>
                          <td className="px-3 py-2 text-sm">{observations.bodyType.notes || 'No notes'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Range of Motion Section */}
            {smartSummaryInclusion.rangeOfMotion && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Range of Motion</h3>
                {romFindings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-2 text-left font-semibold border-r text-sm">Body Part/Motion</th>
                          {romFindings[0]?.dates?.map((date: string) => (
                            <th key={date} className="px-1 py-2 text-center font-semibold border-r text-xs" colSpan={2}>
                              {format(parseISO(date), 'MM/dd')}
                            </th>
                          ))}
                          <th className="px-2 py-2 text-left font-semibold text-sm">Normal/Notes</th>
                        </tr>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-2 text-left font-semibold border-r text-sm"></th>
                          {romFindings[0]?.dates?.map((date: string) => (
                            <React.Fragment key={date}>
                              <th className="px-1 py-1 text-center font-semibold border-r text-xs min-w-12">Left</th>
                              <th className="px-1 py-1 text-center font-semibold border-r text-xs min-w-12">Right</th>
                            </React.Fragment>
                          ))}
                          <th className="px-2 py-2 text-left font-semibold text-sm"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Group findings by body part and motion only (combine active/passive in same row)
                          const groupedFindings = romFindings.reduce((acc: any, finding: any) => {
                            const key = `${finding.bodyPart}-${finding.motion}`;
                            if (!acc[key]) {
                              acc[key] = {
                                bodyPart: finding.bodyPart,
                                motion: finding.motion,
                                normal: finding.normal,
                                dates: finding.dates,
                                activeLeftValues: {},
                                activeRightValues: {},
                                passiveLeftValues: {},
                                passiveRightValues: {},
                                type: finding.type
                              };
                            }
                            
                            const isActive = finding.side.includes('active');
                            if (finding.side.includes('left')) {
                              if (isActive) {
                                acc[key].activeLeftValues = finding.historicalValues;
                              } else {
                                acc[key].passiveLeftValues = finding.historicalValues;
                              }
                            } else if (finding.side.includes('right')) {
                              if (isActive) {
                                acc[key].activeRightValues = finding.historicalValues;
                              } else {
                                acc[key].passiveRightValues = finding.historicalValues;
                              }
                            }
                            
                            return acc;
                          }, {});
                          
                          return Object.values(groupedFindings).map((group: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="px-2 py-2 border-r capitalize text-sm font-medium">
                                {group.bodyPart} - {group.motion}
                              </td>
                              {group.dates?.map((date: string) => (
                                <React.Fragment key={date}>
                                  <td className="px-1 py-2 border-r text-center text-sm">
                                    <div className="text-xs">
                                      A: {group.activeLeftValues[date] ? `${group.activeLeftValues[date]}°` : '-'} / P: {group.passiveLeftValues[date] ? `${group.passiveLeftValues[date]}°` : '-'}
                                    </div>
                                  </td>
                                  <td className="px-1 py-2 border-r text-center text-sm">
                                    <div className="text-xs">
                                      A: {group.activeRightValues[date] ? `${group.activeRightValues[date]}°` : '-'} / P: {group.passiveRightValues[date] ? `${group.passiveRightValues[date]}°` : '-'}
                                    </div>
                                  </td>
                                </React.Fragment>
                              ))}
                              <td className="px-2 py-2 text-sm">
                                <div className="space-y-1">
                                  <div><span className="font-medium">Normal:</span> {group.normal}°</div>
                                </div>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm p-4 border border-gray-200 rounded">
                    No Range of Motion data recorded for this evaluation.
                  </div>
                )}
              </section>
            )}

            {/* Strength Testing Section */}
            {smartSummaryInclusion.strengthTesting && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Strength Testing</h3>
                {strengthFindings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-2 text-left font-semibold border-r text-sm">Body Part/Movement</th>
                          {strengthFindings[0]?.dates?.map((date: string) => (
                            <th key={date} className="px-1 py-2 text-center font-semibold border-r text-xs" colSpan={2}>
                              {format(parseISO(date), 'MM/dd')}
                            </th>
                          ))}
                          <th className="px-2 py-2 text-left font-semibold text-sm">Notes</th>
                        </tr>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-2 text-left font-semibold border-r text-sm"></th>
                          {strengthFindings[0]?.dates?.map((date: string) => (
                            <React.Fragment key={date}>
                              <th className="px-1 py-1 text-center font-semibold border-r text-xs min-w-12">Left</th>
                              <th className="px-1 py-1 text-center font-semibold border-r text-xs min-w-12">Right</th>
                            </React.Fragment>
                          ))}
                          <th className="px-2 py-2 text-left font-semibold text-sm"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Helper function to determine color based on bilateral equality
                          const getStrengthColorClass = (leftValue: any, rightValue: any) => {
                            // If both values exist and are equal, use normal color (black)
                            if (leftValue && rightValue && leftValue === rightValue) {
                              return 'text-gray-800';
                            }
                            // If values are different or only one side has a value, highlight in red
                            if (leftValue || rightValue) {
                              return 'text-red-600';
                            }
                            // Default for empty values
                            return 'text-gray-400';
                          };
                          
                          // Helper function to format strength values with test type abbreviations
                          const formatStrengthValue = (value: number | string, testType: string) => {
                            if (!value) return '-';
                            
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
                                return `${value}/5 (MMT)`; // Default to manual
                            }
                          };
                          
                          // Group findings by body part and movement
                          const groupedFindings = strengthFindings.reduce((acc: any, finding: any) => {
                            const key = `${finding.bodyPart}-${finding.movement}`;
                            if (!acc[key]) {
                              acc[key] = {
                                bodyPart: finding.bodyPart,
                                movement: finding.movement,
                                dates: finding.dates,
                                leftValues: {},
                                rightValues: {},
                                notes: finding.notes,
                                type: finding.type,
                                testType: finding.testType
                              };
                            }
                            
                            if (finding.side.includes('left')) {
                              acc[key].leftValues = finding.historicalValues;
                            } else if (finding.side.includes('right')) {
                              acc[key].rightValues = finding.historicalValues;
                            }
                            
                            // Consolidate notes
                            if (finding.notes && !acc[key].notes.includes(finding.notes)) {
                              acc[key].notes = acc[key].notes ? `${acc[key].notes}; ${finding.notes}` : finding.notes;
                            }
                            
                            return acc;
                          }, {});
                          
                          return Object.values(groupedFindings).map((group: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="px-2 py-2 border-r capitalize text-sm font-medium">
                                {group.bodyPart} - {group.movement}
                              </td>
                              {group.dates?.map((date: string) => (
                                <React.Fragment key={date}>
                                  <td className={`px-1 py-2 border-r text-center text-sm font-medium ${getStrengthColorClass(group.leftValues[date], group.rightValues[date])}`}>
                                    {formatStrengthValue(group.leftValues[date], group.testType)}
                                  </td>
                                  <td className={`px-1 py-2 border-r text-center text-sm font-medium ${getStrengthColorClass(group.leftValues[date], group.rightValues[date])}`}>
                                    {formatStrengthValue(group.rightValues[date], group.testType)}
                                  </td>
                                </React.Fragment>
                              ))}
                              <td className="px-2 py-2 text-sm">
                                <div className="space-y-1">
                                  {group.notes && <div><span className="font-medium">Notes:</span> {group.notes}</div>}
                                  {!group.notes && <div className="text-gray-500">No notes</div>}
                                </div>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm p-4 border border-gray-200 rounded">
                    No Strength Testing data recorded for this evaluation.
                  </div>
                )}
              </section>
            )}

            {/* Special Tests Section */}
            {smartSummaryInclusion.specialTests && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Special Tests</h3>
                {specialTestFindings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-2 text-left font-semibold border-r text-sm">Body Part/Test</th>
                          {specialTestFindings[0]?.dates?.map((date: string) => (
                            <th key={date} className="px-1 py-2 text-center font-semibold border-r text-xs" colSpan={2}>
                              {format(parseISO(date), 'MM/dd')}
                            </th>
                          ))}
                          <th className="px-2 py-2 text-left font-semibold text-sm">Notes</th>
                        </tr>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-2 text-left font-semibold border-r text-sm"></th>
                          {specialTestFindings[0]?.dates?.map((date: string) => (
                            <React.Fragment key={date}>
                              <th className="px-1 py-1 text-center font-semibold border-r text-xs min-w-12">Left</th>
                              <th className="px-1 py-1 text-center font-semibold border-r text-xs min-w-12">Right</th>
                            </React.Fragment>
                          ))}
                          <th className="px-2 py-2 text-left font-semibold text-sm"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Group findings by body part and test
                          const groupedFindings = specialTestFindings.reduce((acc: any, finding: any) => {
                            const key = `${finding.bodyPart}-${finding.test}`;
                            if (!acc[key]) {
                              acc[key] = {
                                bodyPart: finding.bodyPart,
                                test: finding.test,
                                dates: finding.dates,
                                leftValues: {},
                                rightValues: {},
                                notes: finding.notes,
                                type: finding.type
                              };
                            }
                            
                            if (finding.side.includes('left')) {
                              acc[key].leftValues = finding.historicalValues;
                            } else if (finding.side.includes('right')) {
                              acc[key].rightValues = finding.historicalValues;
                            }
                            
                            // Consolidate notes
                            if (finding.notes && !acc[key].notes.includes(finding.notes)) {
                              acc[key].notes = acc[key].notes ? `${acc[key].notes}; ${finding.notes}` : finding.notes;
                            }
                            
                            return acc;
                          }, {});
                          
                          return Object.values(groupedFindings).map((group: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="px-2 py-2 border-r capitalize text-sm font-medium">
                                {group.bodyPart} - {group.test}
                              </td>
                              {group.dates?.map((date: string) => (
                                <React.Fragment key={date}>
                                  <td className="px-1 py-2 border-r text-center text-sm">
                                    <span className={`${
                                      group.leftValues[date] === 'positive' ? 'text-red-600 font-medium' : 
                                      group.leftValues[date] === 'negative' ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                      {group.leftValues[date] ? (
                                        group.leftValues[date] === 'positive' ? '✓' : 
                                        group.leftValues[date] === 'negative' ? '✗' : '?'
                                      ) : '-'}
                                    </span>
                                  </td>
                                  <td className="px-1 py-2 border-r text-center text-sm">
                                    <span className={`${
                                      group.rightValues[date] === 'positive' ? 'text-red-600 font-medium' : 
                                      group.rightValues[date] === 'negative' ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                      {group.rightValues[date] ? (
                                        group.rightValues[date] === 'positive' ? '✓' : 
                                        group.rightValues[date] === 'negative' ? '✗' : '?'
                                      ) : '-'}
                                    </span>
                                  </td>
                                </React.Fragment>
                              ))}
                              <td className="px-2 py-2 text-sm">
                                {group.notes || 'No additional notes'}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm p-4 border border-gray-200 rounded">
                    No Special Tests data recorded for this evaluation.
                  </div>
                )}
              </section>
            )}

            {/* Functional Testing Section */}
            {smartSummaryInclusion.functionalTesting && functionalTesting && (
              <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Functional Testing</h3>
                
                {/* Upper Quarter */}
                {functionalTesting.upperQuarter && Object.values(functionalTesting.upperQuarter).some((test: any) => test?.result) && (
                  <div className="mb-6">
                    <h4 className="text-base font-semibold mb-2 text-gray-700">Upper Quarter</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/3">Test</th>
                            <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Result</th>
                            <th className="px-3 py-2 text-left font-semibold text-sm w-5/12">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(functionalTesting.upperQuarter).map(([testKey, testData]: [string, any]) => 
                            testData?.result ? (
                              <tr key={testKey} className="border-b">
                                <td className="px-3 py-2 border-r text-sm font-medium">
                                  {testKey === 'shoulderFlexion' ? 'Shoulder Flexion' :
                                   testKey === 'functionalReach' ? 'Functional Reach' :
                                   testKey === 'ndi' ? 'NDI' :
                                   testKey === 'dashQuickDash' ? 'DASH QuickDASH' :
                                   testKey === 'gripStrength' ? 'Grip Strength' : testKey}
                                </td>
                                <td className="px-3 py-2 border-r text-sm capitalize">{testData.result}</td>
                                <td className="px-3 py-2 text-sm">{testData.notes || 'No notes'}</td>
                              </tr>
                            ) : null
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Lower Quarter */}
                {functionalTesting.lowerQuarter && Object.values(functionalTesting.lowerQuarter).some((test: any) => test?.result) && (
                  <div className="mb-6">
                    <h4 className="text-base font-semibold mb-2 text-gray-700">Lower Quarter</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/3">Test</th>
                            <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Result</th>
                            <th className="px-3 py-2 text-left font-semibold text-sm w-5/12">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(functionalTesting.lowerQuarter).map(([testKey, testData]: [string, any]) => 
                            testData?.result ? (
                              <tr key={testKey} className="border-b">
                                <td className="px-3 py-2 border-r text-sm font-medium">
                                  {testKey === 'singleLegStance' ? 'Single Leg Stance' :
                                   testKey === 'functionalSquat' ? 'Functional Squat' :
                                   testKey === 'stepDown' ? 'Step Down' :
                                   testKey === 'tug' ? 'TUG' :
                                   testKey === 'sixMinWalk' ? '6 Min Walk' :
                                   testKey === 'starExcursion' ? 'Star Excursion' : testKey}
                                </td>
                                <td className="px-3 py-2 border-r text-sm capitalize">{testData.result}</td>
                                <td className="px-3 py-2 text-sm">{testData.notes || 'No notes'}</td>
                              </tr>
                            ) : null
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Whole Body */}
                {functionalTesting.wholeBody && Object.values(functionalTesting.wholeBody).some((test: any) => test?.result) && (
                  <div className="mb-6">
                    <h4 className="text-base font-semibold mb-2 text-gray-700">Whole Body</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/3">Test</th>
                            <th className="px-3 py-2 text-left font-semibold border-r text-sm w-1/4">Result</th>
                            <th className="px-3 py-2 text-left font-semibold text-sm w-5/12">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(functionalTesting.wholeBody).map(([testKey, testData]: [string, any]) => 
                            testData?.result ? (
                              <tr key={testKey} className="border-b">
                                <td className="px-3 py-2 border-r text-sm font-medium">
                                  {testKey === 'fms' ? 'FMS' :
                                   testKey === 'bergBalance' ? 'Berg Balance' :
                                   testKey === 'adlAssessment' ? 'ADL Assessment' :
                                   testKey === 'staticPosture' ? 'Static Posture' :
                                   testKey === 'gaitAnalysis' ? 'Gait Analysis' : testKey}
                                </td>
                                <td className="px-3 py-2 border-r text-sm capitalize">{testData.result}</td>
                                <td className="px-3 py-2 text-sm">{testData.notes || 'No notes'}</td>
                              </tr>
                            ) : null
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Show message if no functional testing data */}
                {!Object.values(functionalTesting).some((section: any) => 
                  section && Object.values(section).some((test: any) => test?.result)
                ) && (
                  <div className="text-gray-500 text-sm p-4 border border-gray-200 rounded">
                    No Functional Testing data recorded for this evaluation.
                  </div>
                )}
              </section>
            )}


            {/* Clinical Notes Section - Dual View (Editable + Print Narrative) */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Clinical Notes</h3>
              
              {/* Screen Version - Editable Textareas */}
              <div className="clinical-notes-editable space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Clinical Care Path:</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    value={clinicalNotes.clinicalCarePath}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, clinicalCarePath: e.target.value }))}
                    placeholder="Describe the current treatment approach and interventions being used..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issues or Problems Identified:</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    value={clinicalNotes.issuesIdentified}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, issuesIdentified: e.target.value }))}
                    placeholder="List any complications, barriers to progress, or concerns identified during evaluation..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Plan to Address Issues:</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    value={clinicalNotes.suggestedPlan}
                    onChange={(e) => setClinicalNotes(prev => ({ ...prev, suggestedPlan: e.target.value }))}
                    placeholder="Outline recommended interventions, referrals, or modifications to the treatment plan..."
                  />
                </div>
              </div>

              {/* Print Version - Clean Narrative Text */}
              <div className="clinical-notes-print" style={{ display: 'none' }}>
                {clinicalNotes.clinicalCarePath && (
                  <div className="mb-6">
                    <h4 className="text-base font-semibold text-gray-800 mb-2">Current Clinical Care Path:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {clinicalNotes.clinicalCarePath}
                    </p>
                  </div>
                )}
                
                {clinicalNotes.issuesIdentified && (
                  <div className="mb-6">
                    <h4 className="text-base font-semibold text-gray-800 mb-2">Issues or Problems Identified:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {clinicalNotes.issuesIdentified}
                    </p>
                  </div>
                )}
                
                {clinicalNotes.suggestedPlan && (
                  <div className="mb-6">
                    <h4 className="text-base font-semibold text-gray-800 mb-2">Suggested Plan to Address Issues:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {clinicalNotes.suggestedPlan}
                    </p>
                  </div>
                )}
                
                {/* Show message if no notes are entered */}
                {!clinicalNotes.clinicalCarePath && !clinicalNotes.issuesIdentified && !clinicalNotes.suggestedPlan && (
                  <div className="text-sm text-gray-500 italic">
                    No clinical notes have been entered for this evaluation.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>This summary was generated on {format(new Date(), 'MMMM dd, yyyy')} from the Patient Evaluation System</p>
          </div>
        </div>

        {/* Print Styles - Embedded CSS for print functionality */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .screen-hidden { display: none; }
            .print-header { margin-bottom: 20px; }
            .clinical-notes-print { display: none; }
            /* Wound photo positioning for print */
            .wound-photo-screen { display: block; }
            .wound-photo-print { display: none; }
            /* Ensure consistent image sizing */
            .w-24 { width: 96px; }
            .h-24 { height: 96px; }
            .w-16 { width: 64px; }
            .h-16 { height: 64px; }
            .w-32 { width: 128px; }
            .h-32 { height: 128px; }
            .border { border-width: 1px; }
            .border-gray-200 { border-color: #e5e7eb; }
            .mt-2 { margin-top: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .space-y-1 > * + * { margin-top: 4px; }
            img { max-width: 100%; height: auto; object-fit: cover; }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; }
            h3 { page-break-after: avoid; }
            section { page-break-inside: avoid; margin-bottom: 20px; }
            @media print {
              .screen-hidden { display: block !important; }
              .print-header { display: block !important; }
              .clinical-notes-editable { display: none !important; }
              .clinical-notes-print { display: block !important; }
              /* Wound photo positioning - CRITICAL FIX */
              .wound-photo-screen { display: none !important; }
              .wound-photo-print { display: block !important; }
              .w-24 { width: 96px !important; }
              .h-24 { height: 96px !important; }
              .w-18 { width: 72px !important; }
              .h-18 { height: 72px !important; }
              .w-16 { width: 64px !important; }
              .h-16 { height: 64px !important; }
              .w-32 { width: 128px !important; }
              .h-32 { height: 128px !important; }
              img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
            }
          `
        }} />
      </div>
    </div>
    );
  } catch (error) {
    handleRenderError(error as Error);
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-8 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-600">Error Loading Summary</h2>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-semibold text-red-800 mb-2">Unable to generate evaluation summary</h3>
            <p className="text-red-700 mb-4">
              There was an error loading the evaluation data. Please try refreshing and trying again.
            </p>
            <p className="text-sm text-gray-600 mt-4">Error: {(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return summaryContent;
}
