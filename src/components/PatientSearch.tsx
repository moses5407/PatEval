import React, { useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Search, RotateCcw, X, AlertCircle } from 'lucide-react';
import { FormField } from './ui/FormField';
import { DateField } from './ui/DateField';
import { searchPatients } from '../lib/dataAccess';
import { useAuthStore } from '../lib/store/auth';

export interface PatientSearchRef {
  reset: () => void;
}

interface PatientSearchProps {
  onPatientFound: (patientId: string, fullName: string, dateOfBirth: string) => void;
  onReset?: () => void;
}

export const PatientSearch = forwardRef<PatientSearchRef, PatientSearchProps>(({ onPatientFound, onReset }, ref) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const clearSearch = useCallback(() => {
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(null);
  }, []);

  const handleReset = () => {
    clearSearch();
    onReset?.();
  };

  useImperativeHandle(ref, () => ({
    reset: clearSearch
  }), [clearSearch]);

  const handleSearch = async () => {
    if (!isSearching) {
      try {
        setSearchError(null);
        const results = await searchPatients(firstName, lastName, dateOfBirth);
        setSearchResults(results);
        setIsSearching(true);
        
        if (results.length === 0) {
          setSearchError('No patients found matching the search criteria.');
        }
      } catch (error) {
        console.error('Error searching patients:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to search patients';
        setSearchError(errorMessage);
        setSearchResults([]);
        
        // If authentication error, suggest re-login
        if (errorMessage.includes('Authentication')) {
          setSearchError('Authentication required. Please sign out and sign in again.');
        }
      }
    } else {
      clearSearch();
    }
  };

  const handlePatientSelect = (patient: { id: string; firstName: string; lastName: string; dateOfBirth: string }) => {
    onPatientFound(patient.id, `${patient.firstName} ${patient.lastName}`, patient.dateOfBirth);
    clearSearch();
  };

  return (
    <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-[140px]">
          <FormField
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-9"
            labelClassName="text-xs"
            standalone
          />
        </div>
        <div className="flex-1 max-w-[140px]">
          <FormField
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-9"
            labelClassName="text-xs"
            standalone
          />
        </div>
        <div className="flex-1 max-w-[140px]">
          <DateField
            label="Date of Birth"
            value={dateOfBirth}
            onValueChange={setDateOfBirth}
            className="h-9"
            labelClassName="text-xs"
            standalone
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={handleSearch}
            className="h-9 px-4 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {isSearching ? (
              <>
                <X className="w-4 h-4" />
                Close Search
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="h-9 px-3 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Reset search and form"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Display user info for debugging */}
      {user?.isMultiUser && (
        <div className="mt-2 text-xs text-gray-500">
          Clinic: {user.clinicName} | User: {user.name}
        </div>
      )}

      {/* Error message */}
      {searchError && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {searchError}
          </div>
        </div>
      )}

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">
            Found {searchResults.length} patient{searchResults.length !== 1 ? 's' : ''}:
          </div>
          <div className="space-y-1">
            {searchResults.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handlePatientSelect(patient)}
                className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">
                  {patient.firstName} {patient.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

PatientSearch.displayName = 'PatientSearch';