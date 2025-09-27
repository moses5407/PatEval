export class PatientNotFoundError extends Error {
  constructor(message = 'Patient not found') {
    super(message);
    this.name = 'PatientNotFoundError';
  }
}

export class DuplicatePatientError extends Error {
  constructor(message = 'Patient already exists') {
    super(message);
    this.name = 'DuplicatePatientError';
  }
}

export class SaveFailedError extends Error {
  constructor(message = 'Failed to save data') {
    super(message);
    this.name = 'SaveFailedError';
  }
}

export class TransactionFailedError extends Error {
  constructor(message = 'Database transaction failed') {
    super(message);
    this.name = 'TransactionFailedError';
  }
}

export function getErrorMessage(error: Error): { message: string; details?: string } {
  switch (error.name) {
    case 'PatientNotFoundError':
      return {
        message: 'Patient Not Found',
        details: 'Please verify the patient information and try again.'
      };
    case 'DuplicatePatientError':
      return {
        message: 'Patient Already Exists',
        details: 'A patient with this information already exists. Please search for the existing patient.'
      };
    case 'SaveFailedError':
      return {
        message: 'Save Failed',
        details: 'There was an error saving the data. Please try again.'
      };
    case 'TransactionFailedError':
      return {
        message: 'Transaction Failed',
        details: 'The database operation failed. Please try again.'
      };
    default:
      return {
        message: 'An error occurred',
        details: error.message
      };
  }
}