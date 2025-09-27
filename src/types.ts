export type BodyPart = 
  // Spine sections
  | 'cervicalSpine' 
  | 'thoracicSpine' 
  | 'lumbarSpine'
  // Upper extremity joints
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  // Upper extremity segments
  | 'arm'
  | 'forearm'
  | 'hand'
  // Lower extremity joints
  | 'hip'
  | 'knee'
  | 'ankle'
  // Lower extremity segments
  | 'thigh'
  | 'shin'
  | 'foot';

// Rest of the types remain the same...
export type Symptom = 'pain' | 'immobility' | 'swelling' | 'instability' | 'other';
export type Side = 'left' | 'right' | 'bilateral';
export type Surface = 'anterior' | 'posterior' | 'medial' | 'lateral';