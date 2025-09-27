import React from 'react';
import { useFormContext } from 'react-hook-form';
import { PatientForm } from '../../types';
import { formatPhoneNumber } from '../../lib/utils';
import { FormField } from '../ui/FormField';

export function Employer() {
  const { register, watch, formState: { errors } } = useFormContext<PatientForm>();
  const employmentStatus = watch('employmentStatus');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Employment Status <span className="text-red-500">*</span>
        </label>
        <select
          {...register('employmentStatus')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="employed">Employed</option>
          <option value="notEmployed">Not Employed</option>
        </select>
        {errors.employmentStatus && (
          <p className="mt-1 text-sm text-red-600">{errors.employmentStatus.message}</p>
        )}
      </div>

      {employmentStatus === 'employed' && (
        <div className="animate-fade-in rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label="Employer Name"
              required
              {...register('employer.name')}
              error={errors.employer?.name?.message}
            />

            <FormField
              label="Phone"
              required
              type="tel"
              placeholder="(XXX) XXX-XXXX"
              {...register('employer.phone', {
                onChange: (e) => {
                  e.target.value = formatPhoneNumber(e.target.value);
                }
              })}
              error={errors.employer?.phone?.message}
            />

            <div className="md:col-span-2">
              <FormField
                label="Street Address"
                required
                {...register('employer.streetAddress')}
                error={errors.employer?.streetAddress?.message}
              />
            </div>

            <FormField
              label="City"
              required
              {...register('employer.city')}
              error={errors.employer?.city?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="State"
                required
                {...register('employer.state')}
                error={errors.employer?.state?.message}
              />

              <FormField
                label="ZIP Code"
                required
                {...register('employer.zipCode')}
                error={errors.employer?.zipCode?.message}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}