import React, { useState, useEffect } from 'react';
import { X, Users, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { FormSelect } from '../ui/FormSelect';
import { grantPatientPermission, getClinicTherapists } from '../../lib/permissionAccess';
import { useToastStore } from '../../lib/store/toast';
import type { TherapistProfile } from '../../types/permissions';

interface PermissionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onPermissionGranted: () => void;
}

export function PermissionRequestModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  onPermissionGranted
}: PermissionRequestModalProps) {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'edit' | 'full'>('view');
  const [expiresIn, setExpiresIn] = useState('never');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (isOpen) {
      loadTherapists();
    }
  }, [isOpen]);

  const loadTherapists = async () => {
    setLoadingTherapists(true);
    try {
      const therapistList = await getClinicTherapists();
      setTherapists(therapistList);
    } catch (error) {
      console.error('Failed to load therapists:', error);
      addToast('error', 'Failed to load therapist list');
    } finally {
      setLoadingTherapists(false);
    }
  };

  const handleGrantPermission = async () => {
    if (!selectedTherapist) {
      addToast('error', 'Please select a therapist');
      return;
    }

    setIsLoading(true);
    try {
      let expiresAt: string | undefined;
      if (expiresIn !== 'never') {
        const days = parseInt(expiresIn);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
        expiresAt = expirationDate.toISOString();
      }

      await grantPatientPermission(
        patientId,
        selectedTherapist,
        permissionLevel,
        expiresAt
      );

      const therapistName = therapists.find(t => t.id === selectedTherapist)?.full_name || 'therapist';
      addToast('success', `Permission granted to ${therapistName}`);
      
      onPermissionGranted();
      handleClose();
    } catch (error) {
      console.error('Failed to grant permission:', error);
      addToast('error', 'Failed to grant permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTherapist('');
    setPermissionLevel('view');
    setExpiresIn('never');
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Grant Patient Access</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Patient: {patientName}</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Grant access to another therapist in your clinic to collaborate on this patient's care.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Therapist
              </label>
              {loadingTherapists ? (
                <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-500">Loading therapists...</span>
                </div>
              ) : (
                <FormSelect
                  value={selectedTherapist}
                  onChange={(e) => setSelectedTherapist(e.target.value)}
                  className="w-full"
                >
                  <option value="">Choose a therapist...</option>
                  {(therapists || []).map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.full_name} ({therapist.role})
                    </option>
                  ))}
                </FormSelect>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permission Level
              </label>
              <FormSelect
                value={permissionLevel}
                onChange={(e) => setPermissionLevel(e.target.value as 'view' | 'edit' | 'full')}
                className="w-full"
              >
                <option value="view">View Only - Can view patient data and evaluations</option>
                <option value="edit">Edit Access - Can edit evaluations and patient data</option>
                <option value="full">Full Access - Can edit data and manage permissions</option>
              </FormSelect>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Duration
              </label>
              <FormSelect
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full"
              >
                <option value="never">Permanent access</option>
                <option value="7">1 week</option>
                <option value="30">1 month</option>
                <option value="90">3 months</option>
                <option value="180">6 months</option>
              </FormSelect>
            </div>

            <div>
              <FormField
                label="Reason (Optional)"
                type="textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief reason for granting access..."
                rows={3}
                standalone
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGrantPermission}
            disabled={isLoading || !selectedTherapist}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Granting...</span>
              </div>
            ) : (
              'Grant Access'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}