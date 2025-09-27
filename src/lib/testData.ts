import { clearDatabase, addTestPatient } from './db';
import { generateTestData } from './testDataGenerator';

export async function initializeTestData() {
  try {
    // First clear the existing database
    await clearDatabase();
    
    // Generate the new test data with 8 patients
    const patients = generateTestData();
    
    // Add each patient and their evaluations
    for (const patient of patients) {
      try {
        await addTestPatient(patient);
      } catch (error) {
        console.error(`Error adding patient ${patient.firstName} ${patient.lastName}:`, error);
      }
    }
  } catch (error) {
    console.error('Error initializing test data:', error);
    throw error;
  }
}