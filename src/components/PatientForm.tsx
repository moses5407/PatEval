import React, { useState, useRef, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { PatientForm as PatientFormType } from '../types/index';
import { formSchema } from '../lib/validation';
import { Section } from './ui/Section';
import { SectionWithCheckbox } from './ui/SectionWithCheckbox';
import { Demographics } from './sections/Demographics';
import { Employer } from './sections/Employer';
import { EmergencyContact } from './sections/EmergencyContact';
import { Observations } from './sections/Observations';
import { ProblemSelection } from './sections/ProblemSelection';
import { Timeline } from './sections/Timeline';
import { RangeOfMotion } from './sections/RangeOfMotion';
import { SpecialTests } from './sections/SpecialTests';
import { StrengthTesting } from './sections/StrengthTesting';
import { FunctionalTesting } from './sections/FunctionalTesting';
import { Button } from './ui/Button';
import { DateField } from './ui/DateField';
import { PatientSearch, PatientSearchRef } from './PatientSearch';
import { PatientHistory } from './PatientHistory';
import { EvaluationSummary } from './EvaluationSummary';
import { FullNarrativeSummary } from './FullNarrativeSummary';
import { PatientPermissionsPanel } from './permissions/PatientPermissionsPanel';
import { PermissionStatusBadge } from './permissions/PermissionStatusBadge';
import { saveFormData, getPatientEvaluations, getEvaluationDetails } from '../lib/dataAccess';
import { canManagePatientPermissions } from '../lib/permissionAccess';
import { useAuthStore } from '../lib/store/auth';
import { format, parseISO } from 'date-fns';
import { useToastStore } from '../lib/store/toast';
import { bodyParts } from '../lib/constants';
import { generateId } from '../lib/utils';
import { Shield } from 'lucide-react';

const emptyFormState = {
  evaluationDate: format(new Date(), 'yyyy-MM-dd'),
  isExistingPatient: false,
  demographics: {
    prefix: '',
    prefixOther: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    suffixOther: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    email: '',
    photo: ''
  },
  employmentStatus: '',
  employer: {
    name: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  },
  emergencyContact: {
    firstName: '',
    lastName: '',
    relationship: '',
    relationshipOther: '',
    phone: '',
    email: ''
  },
  observations: {
    posture: {
      assessment: '',
      notes: '',
      includeInSummary: false
    },
    gait: {
      assessment: '',
      notes: '',
      includeInSummary: false
    },
    skinIntegumentary: {
      assessment: '',
      notes: '',
      includeInSummary: false
    },
    assistiveDevices: {
      devices: [],
      notes: '',
      includeInSummary: false
    },
    generalAppearance: {
      assessment: [],
      notes: '',
      includeInSummary: false
    },
    bodyType: {
      assessment: '',
      notes: '',
      includeInSummary: false
    }
  },
  functionalTesting: {
    upperQuarter: {
      shoulderFlexion: { result: '', notes: '' },
      functionalReach: { result: '', notes: '' },
      ndi: { result: '', notes: '' },
      dashQuickDash: { result: '', notes: '' },
      gripStrength: { result: '', notes: '' }
    },
    lowerQuarter: {
      singleLegStance: { result: '', notes: '' },
      functionalSquat: { result: '', notes: '' },
      stepDown: { result: '', notes: '' },
      tug: { result: '', notes: '' },
      sixMinWalk: { result: '', notes: '' },
      starExcursion: { result: '', notes: '' }
    },
    wholeBody: {
      fms: { result: '', notes: '' },
      bergBalance: { result: '', notes: '' },
      adlAssessment: { result: '', notes: '' },
      staticPosture: { result: '', notes: '' },
      gaitAnalysis: { result: '', notes: '' }
    }
  },
  summaryInclusion: {
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
  },
  selectedParts: [],
  problems: {},
  timeline: [],
  rangeOfMotion: {},
  specialTests: {},
  strengthTesting: {}
};

export function PatientForm() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);
  const [selectedPatientDOB, setSelectedPatientDOB] = useState<string | null>(null);
  const [selectedPatientPhone, setSelectedPatientPhone] = useState<string | null>(null);
  const [selectedEmergencyContact, setSelectedEmergencyContact] = useState<{name: string, relationship: string, phone: string} | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [selectedEvaluationDate, setSelectedEvaluationDate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showFullNarrativeSummary, setShowFullNarrativeSummary] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [canManagePermissions, setCanManagePermissions] = useState(false);
  const [userPermissionLevel, setUserPermissionLevel] = useState<'owner' | 'edit' | 'view' | 'none'>('none');
  const patientSearchRef = useRef<PatientSearchRef>(null);
  const addToast = useToastStore((state) => state.addToast);
  const { user } = useAuthStore();

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(formSchema),
    defaultValues: emptyFormState
  });

  const currentDate = methods.watch('evaluationDate');
  const isHistoricalEvaluation = selectedEvaluationDate === currentDate;

  const handlePatientFound = async (patientId: string, fullName: string, dateOfBirth: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(fullName);
    setSelectedPatientDOB(dateOfBirth);
    
    try {
      const [patientEvals, canManage] = await Promise.all([
        getPatientEvaluations(patientId),
        user?.isMultiUser ? canManagePatientPermissions(patientId) : Promise.resolve(false)
      ]);
      
      setEvaluations(patientEvals);
      setCanManagePermissions(canManage);
      
      // Determine user permission level
      if (user?.isAdmin) {
        setUserPermissionLevel('owner');
      } else if (canManage) {
        setUserPermissionLevel('owner'); // Primary therapist
      } else {
        // In a real implementation, this would be determined by actual permissions
        setUserPermissionLevel('view');
      }
      
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading patient data:', error);
      addToast('error', 'Failed to load patient data', error.message);
    }
  };

  const handleSelectEvaluation = async (evaluation: any) => {
    console.log('=== LOAD DEBUG: Starting evaluation load ===');
    console.log('Loading evaluation:', JSON.stringify(evaluation, null, 2));
    
    try {
      // Load detailed evaluation data from individual tables
      const evaluationDetails = await getEvaluationDetails(evaluation.id);
      console.log('Loaded evaluation details:', evaluationDetails);
      
      // Use the selectedParts directly since getEvaluationDetails already returns them in the correct format
      const selectedParts = evaluationDetails.selectedParts || [];
      
      console.log('Using selectedParts directly:', selectedParts);
      
      // Use the complete evaluation data from getEvaluationDetails
      const formData = {
        id: evaluationDetails.id, // Preserve evaluation ID for updates
        evaluationDate: evaluationDetails.evaluationDate || format(new Date(), 'yyyy-MM-dd'),
        isExistingPatient: false, // Allow editing of all fields when loading evaluation
        demographics: evaluationDetails.demographics,
        employmentStatus: evaluationDetails.employmentStatus || '',
        employer: evaluationDetails.employer,
        emergencyContact: evaluationDetails.emergencyContact,
        selectedParts: selectedParts,
        observations: evaluationDetails.observations,
        functionalTesting: evaluationDetails.functionalTesting,
        summaryInclusion: evaluationDetails.summaryInclusion,
        problems: evaluationDetails.problems,
        timeline: evaluationDetails.timeline,
        rangeOfMotion: evaluationDetails.rangeOfMotion,
        specialTests: evaluationDetails.specialTests,
        strengthTesting: evaluationDetails.strengthTesting
      };
  
      console.log('Structured form data for reset:', JSON.stringify(formData, null, 2));
      console.log('Demographics in structured data:', formData.demographics);
      console.log('Problems in structured data:', formData.problems);
      console.log('Selected parts in structured data:', formData.selectedParts);
      
      // Ensure all data is properly loaded
      methods.reset(formData, {
        keepErrors: false,
        keepDirty: false,
        keepDefaultValues: false
      });
      
      // Debug: Verify data was properly loaded
      setTimeout(() => {
        const loadedValues = methods.getValues();
        console.log('Form values after reset:', JSON.stringify(loadedValues, null, 2));
        console.log('Demographics after reset:', loadedValues.demographics);
        console.log('Problems after reset:', loadedValues.problems);
        console.log('Selected parts after reset:', loadedValues.selectedParts);
        
        if (JSON.stringify(formData.demographics) !== JSON.stringify(loadedValues.demographics)) {
          console.error('LOAD ERROR: Demographics not properly loaded!');
          console.log('Expected:', formData.demographics);
          console.log('Actual:', loadedValues.demographics);
        } else {
          console.log('✅ Demographics loaded successfully');
        }
        
        if (JSON.stringify(formData.problems) !== JSON.stringify(loadedValues.problems)) {
          console.error('LOAD ERROR: Problems not properly loaded!');
          console.log('Expected:', formData.problems);
          console.log('Actual:', loadedValues.problems);
        } else {
          console.log('✅ Problems loaded successfully');
        }
      }, 100);
      
      setSelectedEvaluationDate(evaluationDetails.evaluationDate);
      setSelectedPatientName(`${evaluationDetails.demographics?.firstName || ''} ${evaluationDetails.demographics?.lastName || ''}`.trim());
      setSelectedPatientDOB(evaluationDetails.demographics?.dateOfBirth || '');
      setSelectedPatientPhone(evaluationDetails.demographics?.phone || '');
      
      // Set emergency contact information
      if (evaluationDetails.emergencyContact && (evaluationDetails.emergencyContact.firstName || evaluationDetails.emergencyContact.lastName)) {
        setSelectedEmergencyContact({
          name: `${evaluationDetails.emergencyContact.firstName} ${evaluationDetails.emergencyContact.lastName}`.trim(),
          relationship: evaluationDetails.emergencyContact.relationshipOther || evaluationDetails.emergencyContact.relationship || '',
          phone: evaluationDetails.emergencyContact.phone || ''
        });
      } else {
        setSelectedEmergencyContact(null);
      }
      setShowPatientInfo(true);
      
      setOpenSections({
        // All sections start collapsed - user must manually open them
      });
      
      setShowHistory(false);
      
      // Validate the loaded data
      setTimeout(() => {
        const currentData = methods.getValues();
        console.log('Form data after reset:', currentData);
        console.log('Form validation state:', methods.formState);
      }, 100);
      
    } catch (error) {
      console.error('Error loading evaluation:', error);
      addToast('error', 'Failed to load evaluation data', error.message);
    }
  };

  const handleReset = () => {
    methods.reset(emptyFormState);
    setOpenSections({});
    setSelectedPatientId(null);
    setSelectedPatientName(null);
    setSelectedPatientDOB(null);
    setSelectedPatientPhone(null);
    setSelectedEmergencyContact(null);
    setShowPatientInfo(false);
    setEvaluations([]);
    setShowHistory(false);
    setSelectedEvaluationDate(null);
    if (patientSearchRef.current) {
      patientSearchRef.current.reset();
    }
  };

  const handleCreateSummary = () => {
    try {
      // Check if there's sufficient data for a meaningful summary
      const currentData = methods.getValues();
      console.log('Creating summary with data:', currentData);
      
      // Enhanced validation
      if (!currentData.demographics?.firstName || !currentData.demographics?.lastName) {
        addToast('error', 'Please complete patient demographics before creating summary');
        return;
      }
      
      // Validate form state
      const formErrors = methods.formState.errors;
      if (formErrors && Object.keys(formErrors).length > 0) {
        console.warn('Form has validation errors:', formErrors);
        addToast('warning', 'There are form validation errors. Summary may be incomplete.');
      }
      
      // Log data structure for debugging
      console.log('Form is valid, creating summary with:', {
        demographics: currentData.demographics,
        selectedParts: currentData.selectedParts,
        problems: currentData.problems,
        summaryInclusion: currentData.summaryInclusion,
        formState: methods.formState
      });

      // Clear any existing validation errors for summary generation
      methods.clearErrors();
      setShowSummary(true);
      
    } catch (error) {
      console.error('Error preparing summary data:', error);
      addToast('error', 'Failed to prepare summary data', error.message);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      console.log('=== SAVE DEBUG: Starting form submission ===');
      console.log('Raw form data received:', JSON.stringify(data, null, 2));
      console.log('Selected patient ID:', selectedPatientId);
      console.log('Selected evaluation date:', selectedEvaluationDate);
      console.log('Current evaluation date:', data.evaluationDate);
      
      // Debug: Check if demographics data exists
      console.log('Demographics check:', {
        demographics: data.demographics,
        firstName: data.demographics?.firstName,
        lastName: data.demographics?.lastName,
        phone: data.demographics?.phone,
        email: data.demographics?.email,
        address: data.demographics?.address
      });
      
      // Debug: Check current form values directly from methods
      const currentFormValues = methods.getValues();
      console.log('Direct form values from methods.getValues():', JSON.stringify(currentFormValues, null, 2));
      
      // Debug: Check if there's a mismatch between data and form values
      if (JSON.stringify(data.demographics) !== JSON.stringify(currentFormValues.demographics)) {
        console.warn('MISMATCH: Data parameter demographics differs from form values!');
        console.log('Data parameter demographics:', data.demographics);
        console.log('Form values demographics:', currentFormValues.demographics);
      }

      if (Object.keys(methods.formState.errors).length > 0) {
        console.log('Form validation errors:', methods.formState.errors);
        addToast('error', 'Please fix validation errors before saving', 
          Object.values(methods.formState.errors)
            .map(error => error.message)
            .join(', ')
        );
        return;
      }
      
      // FIXED: Preserve evaluation ID when editing existing evaluations
      // This prevents duplicate evaluations when users edit and save existing evals
      const finalFormData = methods.getValues();
      const hasExistingEvaluationId = finalFormData.id && finalFormData.id.trim() !== '';
      
      // DEBUG: Enhanced logging for duplicate issue diagnosis
      console.log('=== DUPLICATE DIAGNOSIS DEBUG ===');
      console.log('selectedEvaluationDate:', selectedEvaluationDate);
      console.log('data.evaluationDate:', data.evaluationDate);
      console.log('finalFormData.id:', finalFormData.id);
      console.log('hasExistingEvaluationId:', hasExistingEvaluationId);
      console.log('Will preserve ID?', hasExistingEvaluationId);
      
      const saveData = {
        ...finalFormData,
        // Preserve ID if we have an existing evaluation ID (prevents duplicates)
        id: hasExistingEvaluationId ? finalFormData.id : undefined
      };
      
      console.log('Final save data prepared:', JSON.stringify(saveData, null, 2));
      console.log('Demographics in save data:', saveData.demographics);
      console.log('ID in save data:', saveData.id);
      
      console.log('Prepared data for save (isUpdate:', hasExistingEvaluationId, '):', saveData);

      const result = await saveFormData(saveData, selectedPatientId);
      console.log('Save result:', result);

      if (selectedPatientId) {
        const updatedEvals = await getPatientEvaluations(selectedPatientId);
        setEvaluations(updatedEvals);
        console.log('Updated evaluations after save:', updatedEvals);
      }

      const successMessage = hasExistingEvaluationId ? 
        'Evaluation updated successfully' : 
        'New evaluation created successfully';
      addToast('success', successMessage);
      
      // Reset search component state after successful save so user can search again
      if (patientSearchRef.current) {
        patientSearchRef.current.reset();
      }
      
      // Don't reset the form after successful save - user should be able to continue working
    } catch (error) {
      console.error('Error in form submission:', error);
      addToast('error', 'Failed to save evaluation', error.message, () => onSubmit(data));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Critical: Handle problem selection state initialization
  // This ensures problems data is available for summary generation regardless of section visibility
  const selectedParts = methods.watch('selectedParts') || [];
  
  useEffect(() => {
    // Prevent infinite loops by checking if we're already processing
    if (selectedParts.length === 0) {
      return;
    }

    const currentProblems = methods.getValues('problems') || {};
    const updates: { [key: string]: any } = {};
    let hasUpdates = false;

    selectedParts.forEach((partId: string) => {
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
        hasUpdates = true;
      }
    });

    // Update form state if we have new symptom groups
    if (hasUpdates) {
      // Use setTimeout to prevent immediate re-renders
      setTimeout(() => {
        methods.setValue('problems', {
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
      }, 0);
    }
  }, [selectedParts]); // Removed 'methods' to prevent infinite re-renders

  useEffect(() => {
    if (methods.formState.errors && Object.keys(methods.formState.errors).length > 0) {
      console.log('Validation Errors:', methods.formState.errors);
    }
  }, [methods.formState.errors]);

  return (
    <FormProvider {...methods}>
      <div className="relative">
        <PatientSearch 
          ref={patientSearchRef} 
          onPatientFound={handlePatientFound}
          onReset={handleReset}
        />
        
        <div className="relative">
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <div className={`mb-6 transition-all duration-200 ${showHistory ? 'mr-96' : ''}`}>
              {showPatientInfo && selectedPatientName && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Patient</label>
                      <div className="flex items-baseline gap-3">
                        <div className="text-lg font-medium text-gray-900">{selectedPatientName}</div>
                        {selectedPatientDOB && (
                          <div className="text-sm text-gray-600">
                            DOB: {format(parseISO(selectedPatientDOB), 'MM/dd/yyyy')}
                          </div>
                        )}
                        {selectedPatientPhone && (
                          <div className="text-sm text-gray-600">
                            Phone: {selectedPatientPhone}
                          </div>
                        )}
                        {selectedEmergencyContact && (
                          <div className="text-sm text-gray-600">
                            Emergency Contact: {selectedEmergencyContact.name} ({selectedEmergencyContact.relationship}) {selectedEmergencyContact.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Permission Status and Management */}
                    {user?.isMultiUser && selectedPatientId && (
                      <div className="flex items-center gap-3">
                        <PermissionStatusBadge
                          permission={userPermissionLevel}
                          isPrimary={canManagePermissions && !user?.isAdmin}
                          size="sm"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowPermissions(true)}
                          className="flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4" />
                          Manage Access
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <DateField
                    label="Evaluation Date"
                    required
                    {...methods.register('evaluationDate', {
                      onChange: () => setSelectedEvaluationDate(null)
                    })}
                    error={methods.formState.errors.evaluationDate?.message}
                  />
                </div>
                {isHistoricalEvaluation && (
                  <div className="text-sm text-amber-600 mt-6">
                    Modify date to enable editing
                  </div>
                )}
              </div>
            </div>

            <Section 
              title="Patient Information" 
              isOpen={openSections['patientInfo']} 
              onToggle={() => toggleSection('patientInfo')}
            >
              <div className="space-y-6">
                {/* Demographics - Nested Section */}
                <div className="border border-gray-200 rounded-lg">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleSection('demographics')}
                  >
                    <h3 className="text-lg font-medium text-gray-900">Demographics</h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          {...methods.register('summaryInclusion.demographics')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        Include in Summary
                      </label>
                      <svg 
                        className={`h-5 w-5 text-gray-400 transform transition-transform ${openSections['demographics'] ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {openSections['demographics'] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <Demographics />
                    </div>
                  )}
                </div>

                {/* Employer Information - Nested Section */}
                <div className="border border-gray-200 rounded-lg">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleSection('employer')}
                  >
                    <h3 className="text-lg font-medium text-gray-900">Employer Information</h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          {...methods.register('summaryInclusion.employer')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        Include in Summary
                      </label>
                      <svg 
                        className={`h-5 w-5 text-gray-400 transform transition-transform ${openSections['employer'] ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {openSections['employer'] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <Employer />
                    </div>
                  )}
                </div>

                {/* Emergency Contact - Nested Section */}
                <div className="border border-gray-200 rounded-lg">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleSection('emergencyContact')}
                  >
                    <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          {...methods.register('summaryInclusion.emergencyContact')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        Include in Summary
                      </label>
                      <svg 
                        className={`h-5 w-5 text-gray-400 transform transition-transform ${openSections['emergencyContact'] ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {openSections['emergencyContact'] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <EmergencyContact />
                    </div>
                  )}
                </div>
              </div>
            </Section>

            <SectionWithCheckbox 
              title="Problem Selection" 
              isOpen={openSections['problems']} 
              onToggle={() => toggleSection('problems')}
              checkboxName="problems"
              register={methods.register}
            >
              <ProblemSelection />
            </SectionWithCheckbox>

            <SectionWithCheckbox 
              title="Problem Timeline" 
              isOpen={openSections['timeline']} 
              onToggle={() => toggleSection('timeline')}
              checkboxName="timeline"
              register={methods.register}
            >
              <Timeline />
            </SectionWithCheckbox>

            <SectionWithCheckbox 
              title="Observations" 
              isOpen={openSections['observations']} 
              onToggle={() => toggleSection('observations')}
              checkboxName="observations"
              register={methods.register}
            >
              <Observations />
            </SectionWithCheckbox>

            <SectionWithCheckbox 
              title="Range of Motion" 
              isOpen={openSections['rom']} 
              onToggle={() => toggleSection('rom')}
              checkboxName="rangeOfMotion"
              register={methods.register}
            >
              <RangeOfMotion />
            </SectionWithCheckbox>

            <SectionWithCheckbox 
              title="Strength Testing" 
              isOpen={openSections['strength']} 
              onToggle={() => toggleSection('strength')}
              checkboxName="strengthTesting"
              register={methods.register}
            >
              <StrengthTesting />
            </SectionWithCheckbox>

            <SectionWithCheckbox 
              title="Special Tests" 
              isOpen={openSections['tests']} 
              onToggle={() => toggleSection('tests')}
              checkboxName="specialTests"
              register={methods.register}
            >
              <SpecialTests />
            </SectionWithCheckbox>

            <SectionWithCheckbox 
              title="Functional Testing" 
              isOpen={openSections['functionalTesting']} 
              onToggle={() => toggleSection('functionalTesting')}
              checkboxName="functionalTesting"
              register={methods.register}
            >
              <FunctionalTesting />
            </SectionWithCheckbox>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateSummary}
                  disabled={isSaving}
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  Create Summary
                </Button>
                
                {/* Include Narrative Checkbox */}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...methods.register('summaryInclusion.narrative')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include narrative in summary
                </label>
                
                {/* Full Narrative Summary Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFullNarrativeSummary(true)}
                  disabled={isSaving}
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  Create Full Narrative Summary
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  Reset
                </Button>
                <div className="flex items-center gap-3">
                  {isHistoricalEvaluation && (
                    <span className="text-sm text-amber-600">
                      Modify date to enable editing
                    </span>
                  )}
                  <Button 
                    type="submit"
                    disabled={isHistoricalEvaluation || isSaving}
                    loading={isSaving}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {showHistory && (
            <PatientHistory
              evaluations={evaluations}
              onClose={() => {
                setShowHistory(false);
                if (patientSearchRef.current) {
                  patientSearchRef.current.reset();
                }
              }}
              onSelectEvaluation={handleSelectEvaluation}
            />
          )}
          
          {showSummary && (
            <EvaluationSummary
              onClose={() => setShowSummary(false)}
              patientId={selectedPatientId}
              currentEvaluationDate={selectedEvaluationDate || methods.getValues().evaluationDate}
            />
          )}
          
          {showFullNarrativeSummary && (
            <FullNarrativeSummary
              onClose={() => setShowFullNarrativeSummary(false)}
            />
          )}
          
          {showPermissions && selectedPatientId && selectedPatientName && selectedPatientDOB && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <PatientPermissionsPanel
                    patientId={selectedPatientId}
                    patientName={selectedPatientName}
                    patientDOB={selectedPatientDOB}
                    isPrimaryTherapist={canManagePermissions && !user?.isAdmin}
                    onClose={() => setShowPermissions(false)}
                    onPermissionsChanged={() => {
                      // Refresh permission status when permissions change
                      if (selectedPatientId) {
                        canManagePatientPermissions(selectedPatientId).then(setCanManagePermissions);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
}