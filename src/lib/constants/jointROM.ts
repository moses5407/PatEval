export const jointROM = {
  cervicalSpine: {
    flexion: { min: 0, max: 45 },
    extension: { min: 0, max: 45 },
    lateralFlexion: { min: 0, max: 45 },
    rotation: { min: 0, max: 80 }
  },
  thoracicSpine: {
    flexion: { min: 0, max: 45 },
    extension: { min: 0, max: 25 },
    lateralFlexion: { min: 0, max: 20 },
    rotation: { min: 0, max: 35 }
  },
  lumbarSpine: {
    flexion: { min: 0, max: 60 },
    extension: { min: 0, max: 25 },
    lateralFlexion: { min: 0, max: 25 },
    rotation: { min: 0, max: 30 }
  },
  shoulder: {
    flexion: { min: 0, max: 180 },
    extension: { min: 0, max: 60 },
    abduction: { min: 0, max: 180 },
    adduction: { min: 0, max: 50 },
    internalRotation: { min: 0, max: 70 },
    externalRotation: { min: 0, max: 90 }
  },
  elbow: {
    flexion: { min: 0, max: 150 },
    extension: { min: 0, max: 0 },
    pronation: { min: 0, max: 80 },
    supination: { min: 0, max: 80 }
  },
  wrist: {
    flexion: { min: 0, max: 80 },
    extension: { min: 0, max: 70 },
    radialDeviation: { min: 0, max: 20 },
    ulnarDeviation: { min: 0, max: 30 }
  },
  hip: {
    flexion: { min: 0, max: 120 },
    extension: { min: 0, max: 30 },
    abduction: { min: 0, max: 45 },
    adduction: { min: 0, max: 30 },
    internalRotation: { min: 0, max: 45 },
    externalRotation: { min: 0, max: 45 }
  },
  knee: {
    flexion: { min: 0, max: 140 },
    extension: { min: 0, max: 0 }
  },
  ankle: {
    dorsalFlexion: { min: 0, max: 20 },
    plantarFlexion: { min: 0, max: 50 },
    inversion: { min: 0, max: 35 },
    eversion: { min: 0, max: 15 }
  }
} as const;