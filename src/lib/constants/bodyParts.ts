export const bodyParts = {
  cervicalSpine: {
    name: 'Cervical Spine',
    bilateral: true,
    surfaces: ['anterior', 'posterior'],
    hasROM: true,
    type: 'spine'
  },
  thoracicSpine: {
    name: 'Thoracic Spine',
    bilateral: true,
    surfaces: ['anterior', 'posterior'],
    hasROM: true,
    type: 'spine'
  },
  lumbarSpine: {
    name: 'Lumbar Spine',
    bilateral: true,
    surfaces: ['anterior', 'posterior'],
    hasROM: true,
    type: 'spine'
  },
  shoulder: {
    name: 'Shoulder',
    bilateral: true,
    surfaces: ['anterior', 'posterior', 'superior', 'lateral'],
    hasROM: true,
    type: 'joint'
  },
  upperArm: {
    name: 'Upper Arm',
    bilateral: true,
    surfaces: ['anterior', 'posterior', 'medial', 'lateral'],
    hasROM: false,
    type: 'segment'
  },
  elbow: {
    name: 'Elbow',
    bilateral: true,
    surfaces: ['anterior', 'posterior', 'medial', 'lateral'],
    hasROM: true,
    type: 'joint'
  },
  forearm: {
    name: 'Forearm',
    bilateral: true,
    surfaces: ['anterior', 'posterior', 'medial', 'lateral'],
    hasROM: false,
    type: 'segment'
  },
  wrist: {
    name: 'Wrist',
    bilateral: true,
    surfaces: ['anterior', 'posterior', 'medial', 'lateral'],
    hasROM: true,
    type: 'joint'
  },
  hip: {
    name: 'Hip',
    bilateral: true,
    surfaces: ['anterior', 'posterior', 'medial', 'lateral'],
    hasROM: true,
    type: 'joint'
  },
  thigh: {
    name: 'Thigh',
    bilateral: true,
    surfaces: ['anterior', 'posterior', 'medial', 'lateral'],
    hasROM: false,
    type: 'segment'
  },
  knee: {
    name: 'Knee',
    bilateral: true,
    surfaces: ['anterior', 'posterior', 'medial', 'lateral'],
    hasROM: true,
    type: 'joint'
  },
  shin: {
    name: 'Shin',
    bilateral: true,
    surfaces: ['anterior', 'posterior', 'medial', 'lateral'],
    hasROM: false,
    type: 'segment'
  },
  ankle: {
    name: 'Ankle',
    bilateral: true,
    surfaces: ['anterior', 'posterior', 'medial', 'lateral'],
    hasROM: true,
    type: 'joint'
  }
} as const;