import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Users, Calendar, Shield, Eye, Edit3, Crown, X } from 'lucide-react';
import { FormField } from '../ui/FormField';
import { FormSelect } from '../ui/FormSelect';
import { Button } from '../ui/Button';
import { PermissionStatusBadge } from './PermissionStatusBadge';
import { PermissionRequestModal } from './PermissionRequestModal';
import { PermissionManagementPanel } from './PermissionManagementPanel';
import { getPatientsWithPermissions } from '../../lib/permissionAccess';
import { useToastStore } from '../../lib/store/toast';
import { useAuthStore } from '../../lib/store/auth';
import type { PatientWithPermissions } from '../../types/permissions';

export function PatientListWithPermissions() {
  const [patients, setPatients] = useState<PatientWithPermissions[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionFilter, setPermissionFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithPermissions | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showManagementPanel, setShowManagementPanel] = useState(false);
  
  const { user } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    console.log('🔍 PatientListWithPermissions first useEffect triggered - user dependency changed');
    console.log('PatientListWithPermissions useEffect - user:', user);
    console.log('User isMultiUser flag:', user?.isMultiUser);
    
    // Only load patients after user is fully initialized and in multi-user mode
    if (user && user.isMultiUser) {
      console.log('Loading patients in multi-user mode');
      // Add a small delay to ensure authentication session is stable
      const timer = setTimeout(() => {
        console.log('🔍 Timer triggered, calling loadPatients');
        loadPatients();
      }, 500);
      
      return () => {
        console.log('🔍 Cleanup timer');
        clearTimeout(timer);
      };
    } else if (user && !user.isMultiUser) {
      console.log('Single user mode detected - not loading permissions');
      // Single user mode - don't try to load permissions
      setPatients([]);
      setIsLoading(false);
    } else {
      console.log('User not ready or no user found');
      setIsLoading(true);
    }
  }, [user?.isMultiUser, user?.profile_id]); // Only depend on specific user properties

  // Synchronous filtering using useMemo to prevent race conditions
  const filteredPatients = useMemo(() => {
    console.log('🔍 useMemo filteredPatients calculating with:', { 
      patientsLength: patients?.length, 
      searchTerm, 
      permissionFilter 
    });
    
    // Ensure patients is always an array
    const safePatients = Array.isArray(patients) ? patients : [];
    let filtered = [...safePatients];
    
    // Search filter
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(patient => 
        (patient?.firstName || '').toLowerCase().includes(term) ||
        (patient?.lastName || '').toLowerCase().includes(term)
      );
    }

    // Permission filter
    if (permissionFilter && permissionFilter !== 'all') {
      filtered = filtered.filter(patient => patient?.user_permission === permissionFilter);
    }

    console.log('🔍 useMemo filteredPatients result length:', filtered.length);
    return filtered;
  }, [patients, searchTerm, permissionFilter]);

  const loadPatients = async () => {
    console.log('🔍 loadPatients called - starting patient data fetch');
    setIsLoading(true);
    try {
      // Check if we have a valid user before attempting to load
      if (!user || !user.isMultiUser) {
        console.warn('🔍 User not ready for permission loading:', { user, isMultiUser: user?.isMultiUser });
        setPatients([]);
        return;
      }
      
      console.log('🔍 Calling getPatientsWithPermissions...');
      const patientsData = await getPatientsWithPermissions();
      console.log('🔍 Raw patients data received:', patientsData);
      console.log('🔍 Patients data type:', typeof patientsData, 'isArray:', Array.isArray(patientsData));
      console.log('🔍 Patients loaded:', patientsData.length, 'patients');
      
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      console.log('🔍 State updated with patients data');
    } catch (error) {
      console.error('🔍 Failed to load patients:', error);
      addToast('error', 'Failed to load patient list. Please try refreshing the page.');
      setPatients([]);
    } finally {
      setIsLoading(false);
      console.log('🔍 Loading state set to false');
    }
  };



  const handlePatientSelect = (patient: PatientWithPermissions) => {
    setSelectedPatient(patient);
    if (patient.user_permission === 'owner' || user?.isAdmin) {
      setShowManagementPanel(true);
    } else {
      setShowPermissionModal(true);
    }
  };

  const handlePermissionsChanged = () => {
    loadPatients();
  };

  // Prevent rendering during state transitions or when data is not ready
  if (isLoading || !Array.isArray(patients) || !Array.isArray(filteredPatients)) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading patients...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Patient Access Management</h2>
            <p className="text-gray-600">Manage patient access permissions for your clinic</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{Array.isArray(patients) ? patients.length : 0} patients</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <FormField
                label="Search Patients"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="pl-10"
                standalone
              />
              <Search className="absolute left-3 top-8 w-4 h-4 text-gray-400" />
            </div>
            <div className="w-48">
              <FormSelect
                label="Permission Level"
                value={permissionFilter}
                onChange={(e) => setPermissionFilter(e.target.value)}
                standalone
              >
                <option value="all">All Patients</option>
                <option value="owner">Full Access</option>
                <option value="edit">Edit Access</option>
                <option value="view">View Only</option>
                <option value="none">No Access</option>
              </FormSelect>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Patients ({Array.isArray(filteredPatients) ? filteredPatients.length : 0})</h3>
          </div>
          
          {(!Array.isArray(filteredPatients) || filteredPatients.length === 0) ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No patients found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {(() => {
                console.log('🔍 Starting filteredPatients.map() with:', { 
                  type: typeof filteredPatients, 
                  isArray: Array.isArray(filteredPatients), 
                  length: filteredPatients?.length 
                });
                
                const safeFilteredPatients = Array.isArray(filteredPatients) ? filteredPatients : [];
                return safeFilteredPatients.map((patient) => {
                  if (!patient || !patient.id) {
                    console.warn('🚨 Invalid patient data:', patient);
                    return null;
                  }
                  console.log('🔍 Rendering patient:', patient.id, patient.firstName, patient.lastName);
                  return (
                <div
                  key={patient.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h4>
                          <PermissionStatusBadge 
                            permission={patient.userPermission}
                            isPrimary={patient.isPrimaryTherapist}
                            size="sm"
                          />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
                          {Array.isArray(patient?.permissions) && patient.permissions.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {patient.permissions.length} permission{patient.permissions.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {patient.user_permission === 'owner' && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          Can Manage
                        </span>
                      )}
                      {user?.isAdmin && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Admin Override
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Permission Request Modal */}
      {selectedPatient && showPermissionModal && (
        <PermissionRequestModal
          isOpen={showPermissionModal}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedPatient(null);
          }}
          patientId={selectedPatient.id}
          patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
          onPermissionGranted={handlePermissionsChanged}
        />
      )}

      {/* Permission Management Panel */}
      {selectedPatient && showManagementPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedPatient.firstName} {selectedPatient.lastName} - Permission Management
                </h2>
                <button
                  onClick={() => {
                    setShowManagementPanel(false);
                    setSelectedPatient(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <PermissionManagementPanel
                patientId={selectedPatient.id}
                patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                isPrimaryTherapist={selectedPatient.isPrimaryTherapist || false}
                isAdmin={user?.isAdmin || false}
                onPermissionsChanged={handlePermissionsChanged}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}