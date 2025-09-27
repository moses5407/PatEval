import React from 'react';
import { useFormContext } from 'react-hook-form';
import { PatientForm } from '../../types';
import { formatPhoneNumber } from '../../lib/utils';
import { FormField } from '../ui/FormField';

export function EmergencyContact() {
  const { register, watch, formState: { errors } } = useFormContext<PatientForm>();
  const relationship = watch('emergencyContact.relationship');

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FormField
        label="First Name"
        required
        {...register('emergencyContact.firstName')}
        error={errors.emergencyContact?.firstName?.message}
      />

      <FormField
        label="Last Name"
        required
        {...register('emergencyContact.lastName')}
        error={errors.emergencyContact?.lastName?.message}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Relationship <span className="text-red-500">*</span>
        </label>
        <select
          {...register('emergencyContact.relationship')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="spouse">Spouse</option>
          <option value="parent">Parent</option>
          <option value="child">Child</option>
          <option value="sibling">Sibling</option>
          <option value="friend">Friend</option>
          <option value="other">Other</option>
        </select>
        {errors.emergencyContact?.relationship && (
          <p className="mt-1 text-sm text-red-600">
            {errors.emergencyContact.relationship.message}
          </p>
        )}
        {relationship === 'other' && (
          <FormField
            label="Please specify relationship"
            required
            {...register('emergencyContact.relationshipOther')}
            error={errors.emergencyContact?.relationshipOther?.message}
          />
        )}
      </div>

      <FormField
        label="Phone"
        required
        type="tel"
        placeholder="(XXX) XXX-XXXX"
        {...register('emergencyContact.phone', {
          onChange: (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
          }
        })}
        error={errors.emergencyContact?.phone?.message}
      />

      <FormField
        label="Email"
        required
        type="email"
        {...register('emergencyContact.email')}
        error={errors.emergencyContact?.email?.message}
      />
    </div>
  );
}