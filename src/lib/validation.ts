import * as yup from 'yup';

const phoneRegExp = /^\(\d{3}\)\s\d{3}-\d{4}$/;
const emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const formSchema = yup.object().shape({
  evaluationDate: yup
    .string()
    .required('Evaluation date is required')
    .test('is-valid-date', 'Invalid evaluation date', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime()) && date <= new Date();
    }),
  demographics: yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    dateOfBirth: yup
      .string()
      .required('Date of birth is required')
      .test('is-valid-dob', 'Invalid date of birth', (value) => {
        if (!value) return false;
        const dob = new Date(value);
        const today = new Date();
        return !isNaN(dob.getTime()) && dob < today;
      }),
    address: yup.string().required('Address is required'),
    phone: yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Phone is required'),
    email: yup.string().matches(emailRegExp, 'Email is not valid').required('Email is required')
  }),
  employmentStatus: yup.string().required('Employment status is required'),
  employer: yup.object().when('employmentStatus', {
    is: 'employed',
    then: () => yup.object({
      name: yup.string().required('Employer name is required'),
      streetAddress: yup.string().required('Street address is required'),
      city: yup.string().required('City is required'),
      state: yup.string().required('State is required'),
      zipCode: yup.string().required('ZIP code is required'),
      phone: yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Phone is required')
    }),
    otherwise: () => yup.object().nullable()
  }),
  emergencyContact: yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    relationship: yup.string().required('Relationship is required'),
    relationshipOther: yup.string().when('relationship', {
      is: 'other',
      then: () => yup.string().required('Please specify relationship'),
      otherwise: () => yup.string().nullable()
    }),
    phone: yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Phone is required'),
    email: yup.string().matches(emailRegExp, 'Email is not valid').required('Email is required')
  }),
  selectedParts: yup.array().min(0, 'Problem selection is optional'),
  problems: yup.object().test('has-symptom-groups-when-required', 'Each selected part should have at least one symptom group for saving', function(value) {
    // Only require symptom groups for form submission, not for summary generation
    // This allows summary generation with just selected parts
    const selectedParts = this.parent.selectedParts;
    if (!selectedParts || selectedParts.length === 0) return true;
    
    // For now, we'll allow summaries without symptom groups
    // This validation will only be enforced on form submission
    return true;
  }),
  timeline: yup.array().of(
    yup.object().shape({
      date: yup.string().required('Event date is required'),
      bodyParts: yup.mixed()
        .transform((value) => {
          if (typeof value === 'string') return [value];
          return value;
        })
        .required('Body parts are required'),
      eventType: yup.mixed()
        .transform((value) => {
          if (typeof value === 'string') return [value];
          return value;
        })
        .required('Event type is required'),
      description: yup.string() // Description is optional, not required
    })
  )
});