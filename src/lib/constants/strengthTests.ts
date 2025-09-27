export const strengthTests = {
  cervicalSpine: {
    flexion: "Neck Flexors",
    extension: "Neck Extensors",
    lateralFlexion: "Lateral Flexors",
    rotation: "Rotators"
  },
  thoracicSpine: {
    flexion: "Thoracic Flexors",
    extension: "Thoracic Extensors",
    rotation: "Rotators"
  },
  lumbarSpine: {
    flexion: "Lumbar Flexors",
    extension: "Lumbar Extensors",
    lateralFlexion: "Lateral Flexors",
    rotation: "Rotators"
  },
  shoulder: {
    flexion: "Deltoid (Anterior), Coracobrachialis",
    extension: "Deltoid (Posterior), Latissimus Dorsi",
    abduction: "Deltoid (Middle), Supraspinatus",
    adduction: "Pectoralis Major, Latissimus Dorsi",
    internalRotation: "Subscapularis, Pectoralis Major",
    externalRotation: "Infraspinatus, Teres Minor"
  },
  elbow: {
    flexion: "Biceps Brachii, Brachialis",
    extension: "Triceps Brachii",
    pronation: "Pronator Teres, Pronator Quadratus",
    supination: "Supinator, Biceps Brachii"
  },
  wrist: {
    flexion: "Flexor Carpi Radialis/Ulnaris",
    extension: "Extensor Carpi Radialis/Ulnaris",
    radialDeviation: "Flexor/Extensor Carpi Radialis",
    ulnarDeviation: "Flexor/Extensor Carpi Ulnaris"
  },
  hip: {
    flexion: "Iliopsoas, Rectus Femoris",
    extension: "Gluteus Maximus, Hamstrings",
    abduction: "Gluteus Medius/Minimus, TFL",
    adduction: "Adductor Group",
    internalRotation: "Gluteus Medius/Minimus (anterior)",
    externalRotation: "Piriformis, Obturators"
  },
  knee: {
    flexion: "Hamstrings",
    extension: "Quadriceps"
  },
  ankle: {
    dorsalFlexion: "Tibialis Anterior",
    plantarFlexion: "Gastrocnemius, Soleus",
    inversion: "Tibialis Posterior",
    eversion: "Peroneus Longus/Brevis"
  }
} as const;