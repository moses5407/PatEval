import React, { useState } from 'react';
import { Shield, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { PermissionManagementPanel } from '../permissions/PermissionManagementPanel';
import { PermissionStatusBadge } from '../permissions/PermissionStatusBadge';
import { useAuthStore } from '../../lib/store/auth';

interface PatientPermissionsPanelProps {
  patientId: string;
  patientName: string;
  patientDOB: string;
  isPrimaryTherapist: boolean;
  onClose: () => void;
  onPermissionsChanged?: () => void;
}

export function PatientPermissionsPanel({
  patientId,
  patientName,
  patientDOB,
  isPrimaryTherapist,
  onClose,
  onPermissionsChanged
}: PatientPermissionsPanelProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin || false;
  const canManage = isPrimaryTherapist || isAdmin;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Evaluation
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Patient Access Management</h2>
            <p className="text-sm text-gray-600">
              {patientName} • DOB: {new Date(patientDOB).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PermissionStatusBadge
            permission={canManage ? 'owner' : 'view'}
            isPrimary={isPrimaryTherapist}
          />
          {isAdmin && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
              Admin Override
            </span>
          )}
        </div>
      </div>

      {/* Permission Management */}
      <PermissionManagementPanel
        patientId={patientId}
        patientName={patientName}
        isPrimaryTherapist={isPrimaryTherapist}
        isAdmin={isAdmin}
        onPermissionsChanged={onPermissionsChanged}
      />

      {/* Information Panel */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Permission Levels Explained</h3>
            <div className="mt-2 space-y-1 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <PermissionStatusBadge permission="view" size="sm" showText={false} />
                <span>View Only - Can view patient data and evaluations</span>
              </div>
              <div className="flex items-center gap-2">
                <PermissionStatusBadge permission="edit" size="sm" showText={false} />
                <span>Edit Access - Can edit evaluations and patient data</span>
              </div>
              <div className="flex items-center gap-2">
                <PermissionStatusBadge permission="owner" size="sm" showText={false} />
                <span>Full Access - Can edit data and manage permissions</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-blue-700">
              {isPrimaryTherapist
                ? 'As the primary therapist, you can grant access to other therapists in your clinic.'
                : isAdmin
                ? 'As a clinic admin, you can override any permissions and grant independent access.'
                : 'Contact the primary therapist or clinic admin to request access to this patient.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}