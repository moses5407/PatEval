export const specialTests = {
  shoulder: {
    name: 'Shoulder',
    tests: {
      neerTest: {
        name: 'Neer Test',
        description: 'Tests for subacromial impingement',
        instructions: 'With patient seated, stabilize scapula with one hand and passively flex the arm with internal rotation. Test is positive if pain occurs between 90-140 degrees.'
      },
      hawkinsKennedy: {
        name: 'Hawkins-Kennedy Test',
        description: 'Tests for subacromial impingement',
        instructions: 'Flex shoulder and elbow to 90 degrees, then internally rotate the shoulder. Positive if pain is reproduced.'
      },
      emptyCanTest: {
        name: 'Empty Can Test',
        description: 'Tests supraspinatus strength and impingement',
        instructions: 'Have patient abduct arms 90° in scapular plane, forward flex 30°, and internally rotate (thumbs down). Apply downward resistance. Weakness or pain indicates positive test.'
      },
      dropArmTest: {
        name: 'Drop Arm Test',
        description: 'Tests for rotator cuff tear',
        instructions: 'Passively abduct patient\'s arm to 90°. Ask patient to slowly lower the arm. Positive if unable to control lowering or experiences severe pain.'
      },
      apprehensionTest: {
        name: 'Apprehension Test',
        description: 'Tests for anterior shoulder instability',
        instructions: 'With patient supine, abduct arm to 90° and externally rotate. Test is positive if patient shows apprehension or resists further movement.'
      }
    }
  },
  elbow: {
    name: 'Elbow',
    tests: {
      cozensTest: {
        name: 'Cozens Test',
        description: 'Tests for lateral epicondylitis (tennis elbow)',
        instructions: 'With elbow flexed 90°, pronate forearm, extend wrist. Apply resistance to wrist extension. Pain at lateral epicondyle indicates positive test.'
      },
      millsTest: {
        name: 'Mills Test',
        description: 'Tests for lateral epicondylitis',
        instructions: 'With elbow extended, pronate forearm, flex wrist and fingers. Pain at lateral epicondyle with passive extension indicates positive test.'
      },
      golferElbowTest: {
        name: 'Golfer\'s Elbow Test',
        description: 'Tests for medial epicondylitis',
        instructions: 'With elbow extended, supinate forearm, extend wrist. Apply resistance to wrist flexion. Pain at medial epicondyle indicates positive test.'
      },
      valgusStressTest: {
        name: 'Valgus Stress Test',
        description: 'Tests medial collateral ligament integrity',
        instructions: 'With elbow flexed 20-30°, apply valgus force. Excessive opening or pain indicates MCL injury.'
      },
      varusStressTest: {
        name: 'Varus Stress Test',
        description: 'Tests lateral collateral ligament integrity',
        instructions: 'With elbow flexed 20-30°, apply varus force. Excessive opening or pain indicates LCL injury.'
      }
    }
  },
  wrist: {
    name: 'Wrist',
    tests: {
      finkelsteinTest: {
        name: 'Finkelstein Test',
        description: 'Tests for De Quervain\'s tenosynovitis',
        instructions: 'Patient makes fist with thumb inside fingers, then ulnar deviate wrist. Pain over radial styloid indicates positive test.'
      },
      phalenTest: {
        name: 'Phalen\'s Test',
        description: 'Tests for carpal tunnel syndrome',
        instructions: 'Flex both wrists 90° with dorsal surfaces touching for 60 seconds. Numbness/tingling in median nerve distribution indicates positive test.'
      },
      reversePhalenTest: {
        name: 'Reverse Phalen\'s Test',
        description: 'Alternative test for carpal tunnel syndrome',
        instructions: 'Extend both wrists 90° with palmar surfaces touching for 60 seconds. Numbness/tingling in median nerve distribution indicates positive test.'
      },
      tinelSign: {
        name: 'Tinel\'s Sign',
        description: 'Tests for nerve irritation/compression',
        instructions: 'Tap over carpal tunnel. Tingling in median nerve distribution indicates positive test.'
      },
      scaphoidShift: {
        name: 'Scaphoid Shift Test',
        description: 'Tests for scapholunate instability',
        instructions: 'Apply pressure to distal scaphoid while moving wrist from ulnar to radial deviation. Click or pain indicates positive test.'
      }
    }
  },
  knee: {
    name: 'Knee',
    tests: {
      anteriorDrawer: {
        name: 'Anterior Drawer Test',
        description: 'Tests ACL integrity',
        instructions: 'With patient supine, knee flexed 90°, foot flat, pull tibia forward. Excessive anterior translation indicates ACL injury.'
      },
      posteriorDrawer: {
        name: 'Posterior Drawer Test',
        description: 'Tests PCL integrity',
        instructions: 'With knee flexed 90°, push tibia posteriorly. Excessive posterior translation indicates PCL injury.'
      },
      valgusStressTest: {
        name: 'Valgus Stress Test',
        description: 'Tests MCL integrity',
        instructions: 'Apply valgus force to slightly flexed knee. Excessive medial opening indicates MCL injury.'
      },
      varusStressTest: {
        name: 'Varus Stress Test',
        description: 'Tests LCL integrity',
        instructions: 'Apply varus force to slightly flexed knee. Excessive lateral opening indicates LCL injury.'
      },
      mcmurraysTest: {
        name: 'McMurray\'s Test',
        description: 'Tests for meniscal tears',
        instructions: 'Flex knee fully, then extend while rotating tibia. Click or pain with medial rotation suggests lateral meniscus tear; lateral rotation suggests medial tear.'
      }
    }
  },
  hip: {
    name: 'Hip',
    tests: {
      thomasTest: {
        name: 'Thomas Test',
        description: 'Tests for hip flexor tightness',
        instructions: 'Patient supine, flex one hip fully to chest. Positive if opposite thigh rises from table.'
      },
      obers: {
        name: 'Ober\'s Test',
        description: 'Tests for IT band tightness',
        instructions: 'Patient side-lying, stabilize pelvis, abduct and extend hip, then lower into adduction. Positive if leg cannot adduct past horizontal.'
      },
      fabers: {
        name: 'FABER Test',
        description: 'Tests for hip pathology',
        instructions: 'Flex, Abduct, Externally Rotate hip. Pain in groin suggests hip pathology; pain in SI region suggests SI dysfunction.'
      },
      scour: {
        name: 'Scour Test',
        description: 'Tests for acetabular labral tears',
        instructions: 'Apply axial load to flexed hip while moving through arc of motion. Click, catch, or pain suggests labral tear.'
      }
    }
  },
  ankle: {
    name: 'Ankle',
    tests: {
      anteriorDrawer: {
        name: 'Anterior Drawer Test',
        description: 'Tests ATFL integrity',
        instructions: 'With knee flexed and ankle in plantar flexion, pull talus forward. Excessive anterior translation indicates ATFL injury.'
      },
      talarTilt: {
        name: 'Talar Tilt Test',
        description: 'Tests CFL integrity',
        instructions: 'Invert calcaneus with ankle in neutral. Excessive inversion compared to opposite side indicates CFL injury.'
      },
      thompsonTest: {
        name: 'Thompson Test',
        description: 'Tests Achilles tendon integrity',
        instructions: 'Squeeze calf muscle with patient prone and ankle relaxed. Absence of plantar flexion indicates Achilles rupture.'
      }
    }
  },
  cervicalSpine: {
    name: 'Cervical Spine',
    tests: {
      spurlings: {
        name: 'Spurling\'s Test',
        description: 'Tests for cervical radiculopathy',
        instructions: 'Extend and rotate head to affected side, then apply axial compression. Reproduction of radicular symptoms is positive.'
      },
      compressionTest: {
        name: 'Compression Test',
        description: 'Tests for nerve root compression',
        instructions: 'Apply axial compression through head in neutral position. Reproduction of symptoms is positive.'
      },
      distractionTest: {
        name: 'Distraction Test',
        description: 'Tests for nerve root involvement',
        instructions: 'Gently lift patient\'s head to distract cervical spine. Relief of symptoms suggests nerve root involvement.'
      }
    }
  },
  thoracicSpine: {
    name: 'Thoracic Spine',
    tests: {
      segmentalMobility: {
        name: 'Segmental Mobility Test',
        description: 'Tests for thoracic spine mobility and pain',
        instructions: 'Apply posterior to anterior pressure over each thoracic spinous process. Note any hypomobility, hypermobility, or pain.'
      },
      costovertebalJoint: {
        name: 'Costovertebral Joint Test',
        description: 'Tests for rib joint dysfunction',
        instructions: 'Apply pressure over costovertebral joints. Pain or restricted movement indicates dysfunction.'
      },
      seatedRotation: {
        name: 'Seated Rotation Test',
        description: 'Tests for thoracic mobility and pain with rotation',
        instructions: 'With patient seated, stabilize lower thoracic spine and rotate upper thoracic spine. Note restrictions and pain.'
      },
      kemp: {
        name: 'Kemp\'s Test',
        description: 'Tests for thoracic nerve root compression',
        instructions: 'Patient seated, extend and rotate to each side. Pain or symptoms indicate possible nerve root involvement.'
      }
    }
  },
  lumbarSpine: {
    name: 'Lumbar Spine',
    tests: {
      slr: {
        name: 'Straight Leg Raise',
        description: 'Tests for lumbar nerve root tension',
        instructions: 'With patient supine, slowly raise straightened leg. Pain between 30-70° suggests nerve root tension.'
      },
      crossedSLR: {
        name: 'Crossed SLR',
        description: 'Tests for disc herniation',
        instructions: 'Perform SLR on unaffected leg. Pain in affected leg suggests significant disc herniation.'
      },
      faber: {
        name: 'FABER Test',
        description: 'Tests for SI joint dysfunction',
        instructions: 'Place foot on opposite knee, press down on flexed knee. Pain in SI region suggests SI dysfunction.'
      }
    }
  }
} as const;