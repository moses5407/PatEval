import React from 'react';
import { useFormContext } from 'react-hook-form';
import { PatientForm } from '../../types';
import { formatPhoneNumber, calculateAge } from '../../lib/utils';
import { DateField } from '../ui/DateField';
import { PhotoCapture } from '../ui/PhotoCapture';
import { MultiSelect } from '../ui/MultiSelect';

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

export function Demographics() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<PatientForm>();
  const dateOfBirth = watch('demographics.dateOfBirth');
  const prefix = watch('demographics.prefix');
  const suffix = watch('demographics.suffix');
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const isExistingPatient = watch('isExistingPatient');

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Prefix</label>
        <select
          {...register('demographics.prefix')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isExistingPatient}
        >
          <option value="">Select...</option>
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Ms">Ms</option>
          <option value="Dr">Dr</option>
          <option value="Other">Other</option>
        </select>
        {prefix === 'Other' && (
          <input
            type="text"
            {...register('demographics.prefixOther')}
            placeholder="Please specify prefix"
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isExistingPatient}
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('demographics.firstName')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isExistingPatient}
        />
        {errors.demographics?.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.demographics.firstName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Middle Name</label>
        <input
          type="text"
          {...register('demographics.middleName')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isExistingPatient}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('demographics.lastName')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isExistingPatient}
        />
        {errors.demographics?.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.demographics.lastName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Suffix</label>
        <select
          {...register('demographics.suffix')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isExistingPatient}
        >
          <option value="">Select...</option>
          <option value="Jr">Jr</option>
          <option value="Sr">Sr</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
          <option value="Other">Other</option>
        </select>
        {suffix === 'Other' && (
          <input
            type="text"
            {...register('demographics.suffixOther')}
            placeholder="Please specify suffix"
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isExistingPatient}
          />
        )}
      </div>

      <div>
        <DateField
          label="Date of Birth"
          required
          {...register('demographics.dateOfBirth')}
          error={errors.demographics?.dateOfBirth?.message}
          disabled={isExistingPatient}
          className="disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {age !== null && (
          <p className="mt-1 text-sm text-gray-500">Age: {age} years</p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('demographics.address')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.demographics?.address && (
          <p className="mt-1 text-sm text-red-600">{errors.demographics.address.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          {...register('demographics.phone', {
            onChange: (e) => {
              const formatted = formatPhoneNumber(e.target.value);
              e.target.value = formatted;
              setValue('demographics.phone', formatted);
            }
          })}
          placeholder="(XXX) XXX-XXXX"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          inputMode="numeric"
        />
        {errors.demographics?.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.demographics.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          {...register('demographics.email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.demographics?.email && (
          <p className="mt-1 text-sm text-red-600">{errors.demographics.email.message}</p>
        )}
      </div>

      {/* Sports participation */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sports/Activities Participation
        </label>
        <MultiSelect
          options={SPORTS_OPTIONS}
          value={watch('demographics.sports') || []}
          onChange={(selectedSports) => setValue('demographics.sports', selectedSports)}
          placeholder="Select sports or activities..."
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          {...register('demographics.gender')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      {/* Preferred Pronouns */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Preferred Pronouns
        </label>
        <input
          type="text"
          {...register('demographics.preferredPronouns')}
          placeholder="e.g., he/him, she/her, they/them"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Body Type */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Body Type (for narrative)
        </label>
        <select
          {...register('demographics.bodyType')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="slender">Slender</option>
          <option value="average build">Average build</option>
          <option value="athletic">Athletic</option>
          <option value="stocky">Stocky</option>
          <option value="heavyset">Heavyset</option>
          <option value="petite">Petite</option>
          <option value="tall">Tall</option>
        </select>
      </div>

      {/* Photo Capture Section */}
      <div className="md:col-span-2">
        <PhotoCapture
          value={watch('demographics.photo') || ''}
          onChange={(photo) => setValue('demographics.photo', photo)}
          label="Patient Photo"
          disabled={false}
        />
      </div>
    </div>
  );
}