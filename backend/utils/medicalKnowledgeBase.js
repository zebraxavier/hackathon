// ============================================================================
// MEDICAL FIRST AID KNOWLEDGE BASE
// Medically Safe, Non-Diagnostic, Advisory Only
// ============================================================================

const MEDICAL_DISCLAIMER = "\n\n⚠️ This is only first aid guidance and not a medical diagnosis. Please visit a qualified doctor or nearest hospital immediately.";

const EMERGENCY_KEYWORDS = [
  'bleeding', 'blood', 'cut', 'wound', 'gash',
  'burn', 'burning', 'scalded', 'fire',
  'unconscious', 'fainted', 'passed out', 'collapsed',
  'heart attack', 'chest pain', 'heart pain',
  'choking', 'can\'t breathe', 'difficulty breathing',
  'seizure', 'convulsion', 'shaking',
  'fracture', 'broken bone', 'broken arm', 'broken leg',
  'head injury', 'head trauma', 'concussion',
  'allergic reaction', 'allergy', 'swelling',
  'poisoning', 'poison', 'toxic',
  'severe pain', 'extreme pain',
  'accident', 'emergency', 'urgent'
];

const FIRST_AID_RESPONSES = {
  // ============================================================================
  // BLEEDING / CUTS
  // ============================================================================
  bleeding: {
    keywords: ['bleeding', 'blood', 'cut', 'wound', 'gash', 'laceration'],
    response: `I understand this may be concerning. Here are immediate first aid steps for bleeding:

**Immediate Actions:**
• Apply direct pressure with a clean cloth or bandage
• Keep pressure for 10-15 minutes without checking
• Elevate the injured area above heart level if possible
• Do not remove the cloth if blood soaks through - add more layers
• Clean the wound gently with clean water once bleeding stops
• Cover with a sterile bandage

**Warning Signs - Seek Emergency Help If:**
• Bleeding doesn't stop after 15 minutes of pressure
• Blood is spurting or flowing rapidly
• Wound is deep or longer than 1 inch
• Wound is on face, neck, or near vital areas
• Object is embedded in the wound (do not remove it)
• Signs of shock (pale, cold, rapid breathing)

${MEDICAL_DISCLAIMER}`
  },

  // ============================================================================
  // BURNS
  // ============================================================================
  burn: {
    keywords: ['burn', 'burning', 'scalded', 'fire', 'hot water', 'steam'],
    response: `I understand burns can be very painful. Here are immediate first aid steps:

**Immediate Actions:**
• Remove from heat source immediately
• Cool the burn with cool (not ice-cold) running water for 10-20 minutes
• Remove jewelry, watches, or tight clothing before swelling starts
• Do NOT apply ice, butter, oil, or ointments
• Cover with a clean, dry, non-stick bandage or cloth
• Take over-the-counter pain relief if needed

**Warning Signs - Seek Emergency Help If:**
• Burn is larger than 3 inches
• Burn is on face, hands, feet, genitals, or major joints
• Burn appears white, charred, or leathery (3rd degree)
• Burn is caused by chemicals or electricity
• Person is a child or elderly
• Signs of infection develop (increased pain, redness, swelling, pus)

${MEDICAL_DISCLAIMER}`
  },

  // ============================================================================
  // FEVER
  // ============================================================================
  fever: {
    keywords: ['fever', 'high temperature', 'hot', 'burning up', 'temperature'],
    response: `I understand fever can be uncomfortable. Here are steps to manage it:

**Immediate Actions:**
• Rest and stay hydrated - drink plenty of water
• Take temperature with a thermometer
• Remove excess clothing and blankets
• Use a cool, damp cloth on forehead
• Take fever-reducing medication (acetaminophen or ibuprofen) as directed
• Keep room temperature comfortable

**Warning Signs - Seek Medical Help If:**
• Temperature is above 103°F (39.4°C)
• Fever lasts more than 3 days
• Accompanied by severe headache, stiff neck, or confusion
• Difficulty breathing or chest pain
• Persistent vomiting or diarrhea
• Rash appears
• Seizures occur
• In infants under 3 months with any fever

${MEDICAL_DISCLAIMER}`
  },

  // ============================================================================
  // FAINTING / UNCONSCIOUSNESS
  // ============================================================================
  fainting: {
    keywords: ['fainted', 'unconscious', 'passed out', 'collapsed', 'dizzy', 'lightheaded'],
    response: `This requires immediate attention. Here are emergency first aid steps:

**Immediate Actions:**
• Call emergency services (911) immediately if person doesn't wake up
• Check if person is breathing and has a pulse
• Lay person flat on their back
• Elevate legs 12 inches above heart level
• Loosen tight clothing around neck and waist
• Do NOT give anything to eat or drink
• Turn head to side if vomiting occurs
• Keep person warm with a blanket

**Warning Signs - Call 911 Immediately If:**
• Person doesn't regain consciousness within 1 minute
• No breathing or no pulse (start CPR if trained)
• Seizure occurs
• Bleeding from head or severe injury
• Person is diabetic or pregnant
• Chest pain or irregular heartbeat
• Confusion after waking up

${MEDICAL_DISCLAIMER}`
  },

  // ============================================================================
  // CHEST PAIN / HEART ATTACK
  // ============================================================================
  chestPain: {
    keywords: ['chest pain', 'heart attack', 'heart pain', 'chest pressure', 'chest tightness'],
    response: `⚠️ MEDICAL EMERGENCY - This could be serious. Take immediate action:

**CALL 911 IMMEDIATELY**

**While Waiting for Emergency Services:**
• Have person sit down and rest
• Loosen tight clothing
• If person has prescribed nitroglycerin, help them take it
• If person is conscious and not allergic, give 1 adult aspirin (chew it)
• Stay calm and reassure the person
• Monitor breathing and pulse
• Be ready to perform CPR if person becomes unconscious

**Heart Attack Warning Signs:**
• Chest pain, pressure, or squeezing sensation
• Pain spreading to arms, neck, jaw, or back
• Shortness of breath
• Cold sweats
• Nausea or vomiting
• Lightheadedness or dizziness

**DO NOT:**
• Wait to see if symptoms go away
• Drive the person to hospital yourself
• Leave the person alone

⚠️ THIS IS A MEDICAL EMERGENCY. Call 911 immediately and seek emergency medical care.`
  },

  // ============================================================================
  // CHOKING
  // ============================================================================
  choking: {
    keywords: ['choking', 'can\'t breathe', 'difficulty breathing', 'something stuck in throat'],
    response: `⚠️ CHOKING EMERGENCY - Act immediately:

**If Person Can Cough or Speak:**
• Encourage them to keep coughing
• Do not interfere - coughing is most effective
• Stay with them and monitor

**If Person Cannot Breathe, Cough, or Speak:**
• Call 911 immediately
• Perform Heimlich Maneuver (abdominal thrusts):
  1. Stand behind the person
  2. Wrap arms around their waist
  3. Make a fist above navel, below ribcage
  4. Grasp fist with other hand
  5. Give quick, upward thrusts
  6. Repeat until object is expelled

**For Unconscious Person:**
• Call 911
• Begin CPR if trained
• Check mouth for object before rescue breaths

**For Infants (Under 1 Year):**
• Give 5 back blows between shoulder blades
• Then 5 chest thrusts with 2 fingers
• Alternate until object is expelled

⚠️ THIS IS A MEDICAL EMERGENCY. Call 911 and seek immediate emergency care.`
  },

  // ============================================================================
  // FRACTURES / BROKEN BONES
  // ============================================================================
  fracture: {
    keywords: ['fracture', 'broken bone', 'broken arm', 'broken leg', 'broken wrist', 'broken ankle'],
    response: `I understand this is painful. Here are first aid steps for suspected fractures:

**Immediate Actions:**
• Do NOT move the injured area
• Call emergency services if severe or unable to move
• Immobilize the injured area - keep it still
• Apply ice pack wrapped in cloth (20 minutes on, 20 off)
• Elevate if possible to reduce swelling
• Do NOT try to straighten or realign the bone
• Do NOT apply pressure to the injury

**For Suspected Spinal Injury:**
• Do NOT move the person at all
• Call 911 immediately
• Keep head and neck still

**Warning Signs - Seek Emergency Help If:**
• Bone is protruding through skin
• Severe bleeding
• Limb appears deformed or at odd angle
• Numbness or tingling below injury
• Loss of pulse below injury
• Injury to neck, back, or hip
• Person is in severe pain or shock

${MEDICAL_DISCLAIMER}`
  },

  // ============================================================================
  // ALLERGIC REACTIONS
  // ============================================================================
  allergy: {
    keywords: ['allergic reaction', 'allergy', 'swelling', 'hives', 'rash', 'itching', 'anaphylaxis'],
    response: `Allergic reactions can range from mild to severe. Here's what to do:

**For Mild Reactions (Hives, Itching, Mild Swelling):**
• Remove allergen if known
• Take antihistamine (like Benadryl) as directed
• Apply cool compress to affected areas
• Monitor for worsening symptoms

**For SEVERE Reactions (Anaphylaxis) - CALL 911:**
• Use EpiPen/epinephrine auto-injector if available
• Inject into outer thigh, hold for 10 seconds
• Call 911 immediately even if symptoms improve
• Have person lie down with legs elevated
• Loosen tight clothing
• Be ready to perform CPR if needed

**Anaphylaxis Warning Signs - CALL 911:**
• Difficulty breathing or wheezing
• Swelling of face, lips, or throat
• Rapid pulse
• Dizziness or fainting
• Nausea or vomiting
• Skin turning blue or pale

⚠️ Severe allergic reactions are MEDICAL EMERGENCIES. Call 911 immediately and use EpiPen if available.

${MEDICAL_DISCLAIMER}`
  },

  // ============================================================================
  // HEAD INJURY
  // ============================================================================
  headInjury: {
    keywords: ['head injury', 'head trauma', 'concussion', 'hit head', 'bump on head'],
    response: `Head injuries require careful attention. Here are first aid steps:

**Immediate Actions:**
• Keep person still and calm
• Apply ice pack wrapped in cloth to swelling
• Monitor for symptoms of concussion
• Do NOT move person if neck injury suspected
• Do NOT remove any objects stuck in head
• Control bleeding with gentle pressure using clean cloth

**Monitor for Concussion Symptoms:**
• Confusion or disorientation
• Headache
• Dizziness or balance problems
• Nausea or vomiting
• Blurred vision
• Sensitivity to light or noise
• Memory problems

**CALL 911 IMMEDIATELY If:**
• Loss of consciousness (even briefly)
• Severe headache that worsens
• Repeated vomiting
• Seizures
• Unequal pupil sizes
• Clear fluid draining from nose or ears
• Slurred speech or weakness
• Increasing confusion or drowsiness

⚠️ Head injuries can be serious. Seek immediate medical evaluation even if symptoms seem mild.

${MEDICAL_DISCLAIMER}`
  },

  // ============================================================================
  // NOSEBLEED
  // ============================================================================
  nosebleed: {
    keywords: ['nosebleed', 'nose bleeding', 'bloody nose'],
    response: `Nosebleeds are common and usually not serious. Here's how to stop it:

**Immediate Actions:**
• Sit upright and lean slightly forward (not backward)
• Pinch soft part of nose firmly for 10-15 minutes
• Breathe through mouth
• Apply cold compress to bridge of nose
• Do NOT lie down or tilt head back
• Do NOT stuff tissue deep into nose
• After bleeding stops, avoid blowing nose for several hours

**To Prevent Re-bleeding:**
• Keep head elevated
• Avoid hot drinks or spicy foods
• Don't pick or blow nose
• Use humidifier if air is dry
• Apply petroleum jelly inside nostrils gently

**Seek Medical Help If:**
• Bleeding doesn't stop after 20 minutes of pressure
• Bleeding is heavy or rapid
• Difficulty breathing
• Nosebleeds occur frequently
• Following a head injury
• Taking blood thinners
• Bleeding after a blow to the face

${MEDICAL_DISCLAIMER}`
  },

  // ============================================================================
  // FOOD POISONING
  // ============================================================================
  foodPoisoning: {
    keywords: ['food poisoning', 'stomach pain', 'vomiting', 'diarrhea', 'nausea', 'bad food'],
    response: `Food poisoning can be uncomfortable. Here's how to manage it:

**Immediate Actions:**
• Stop eating solid foods temporarily
• Sip clear liquids (water, clear broth, electrolyte drinks)
• Rest and let your body recover
• Gradually reintroduce bland foods (BRAT diet: Bananas, Rice, Applesauce, Toast)
• Avoid dairy, caffeine, alcohol, and fatty foods
• Wash hands frequently to prevent spread

**Stay Hydrated:**
• Drink small amounts frequently
• Oral rehydration solutions are best
• Avoid sugary drinks or sodas

**Warning Signs - Seek Medical Help If:**
• Severe dehydration (dry mouth, little/no urination, dizziness)
• Blood in vomit or stool
• High fever (over 101.5°F / 38.6°C)
• Diarrhea lasting more than 3 days
• Severe abdominal pain
• Neurological symptoms (blurred vision, muscle weakness)
• Pregnant, elderly, or have weakened immune system

${MEDICAL_DISCLAIMER}`
  },

  // ============================================================================
  // PANIC ATTACK
  // ============================================================================
  panicAttack: {
    keywords: ['panic attack', 'anxiety', 'can\'t breathe', 'hyperventilating', 'panic', 'anxious'],
    response: `I understand this feels frightening. Here are steps to help manage a panic attack:

**Immediate Actions:**
• Find a quiet, safe place to sit or lie down
• Focus on slow, deep breathing:
  - Breathe in slowly through nose for 4 counts
  - Hold for 4 counts
  - Breathe out slowly through mouth for 4 counts
  - Repeat until calm
• Remind yourself: "This will pass. I am safe."
• Use grounding techniques: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste

**Helpful Techniques:**
• Close your eyes and visualize a calm place
• Loosen tight clothing
• Drink cool water slowly
• Focus on a single object
• Practice progressive muscle relaxation

**When to Seek Medical Help:**
• First-time panic attack (to rule out other conditions)
• Chest pain (to rule out heart problems)
• Symptoms don't improve after 20-30 minutes
• Frequent panic attacks affecting daily life
• Thoughts of self-harm

**Long-term Management:**
• Consider therapy (CBT is very effective)
• Regular exercise and healthy sleep
• Limit caffeine and alcohol
• Practice stress management techniques

${MEDICAL_DISCLAIMER}`
  }
};

// ============================================================================
// CLINIC INFORMATION RESPONSES
// ============================================================================

const CLINIC_RESPONSES = {
  doctorAvailability: {
    keywords: ['doctor available', 'doctor schedule', 'when is doctor', 'doctor timing', 'consultation hours'],
    response: `Our doctors are available for consultation during the following hours:

**Clinic Hours:**
• Monday - Friday: 9:00 AM - 6:00 PM
• Saturday: 9:00 AM - 2:00 PM
• Sunday: Closed (Emergency services available)

**To Book an Appointment:**
1. Go to the "Appointments" section in your dashboard
2. Select your preferred date and time
3. Choose your doctor (or we'll assign one)
4. Confirm your booking

You can also view your assigned doctor's information in your profile section.

Would you like me to guide you to the appointments page?`
  },

  reports: {
    keywords: ['report', 'lab report', 'test results', 'medical report', 'lab results'],
    response: `Your medical reports and lab results are securely stored in your account.

**To Access Your Reports:**
1. Go to the "Reports" section in your dashboard
2. View all your uploaded reports
3. Download reports as needed
4. Share with doctors during consultations

**Report Types Available:**
• Lab test results
• Imaging reports (X-rays, CT scans, MRI)
• Blood work
• Diagnostic reports

If you have questions about your report results, please schedule a consultation with your doctor for proper interpretation.

${MEDICAL_DISCLAIMER}`
  },

  appointments: {
    keywords: ['appointment', 'book appointment', 'schedule', 'consultation', 'visit'],
    response: `You can easily book an appointment with our doctors.

**Booking Process:**
1. Click on "Appointments" in your dashboard
2. Select your preferred date and time
3. Choose a doctor or let us assign one
4. Add any notes about your concern
5. Confirm your booking

**Appointment Types:**
• General consultation
• Follow-up visits
• Specialist consultations
• Emergency appointments (call clinic directly)

**Cancellation Policy:**
• Cancel up to 24 hours before appointment
• Reschedule anytime through your dashboard

Would you like to book an appointment now?`
  },

  emergency: {
    keywords: ['emergency', 'urgent', 'critical', 'serious', 'immediate help'],
    response: `⚠️ FOR MEDICAL EMERGENCIES:

**Immediate Actions:**
• Call emergency services: 911
• Or visit nearest emergency room immediately

**Our Emergency Contact:**
• Emergency Hotline: [Clinic Emergency Number]
• Available 24/7 for urgent medical guidance

**When to Go to Emergency Room:**
• Chest pain or difficulty breathing
• Severe bleeding or injuries
• Loss of consciousness
• Severe allergic reactions
• Suspected heart attack or stroke
• Severe burns or fractures
• Poisoning or overdose

**For Non-Emergency Urgent Care:**
• Call our clinic during business hours
• Book an urgent appointment through your dashboard
• Use our telehealth service if available

⚠️ If this is a life-threatening emergency, please call 911 or go to the nearest emergency room immediately.`
  }
};

// ============================================================================
// GENERAL HEALTH RESPONSES
// ============================================================================

const GENERAL_RESPONSES = {
  greeting: {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    response: `Hello! I'm your AI healthcare assistant for the Clinical Platform. 👋

I can help you with:
• First aid guidance for emergencies
• Booking appointments
• Accessing your medical reports
• Doctor availability information
• General health queries

How can I assist you today?

⚠️ Remember: For medical emergencies, call 911 immediately.`
  },

  help: {
    keywords: ['help', 'what can you do', 'how can you help', 'assist'],
    response: `I'm here to help you with various healthcare needs:

**Emergency First Aid:**
• Bleeding, burns, fractures
• Choking, fainting, allergic reactions
• Fever, nosebleeds, food poisoning
• And more emergency situations

**Clinic Services:**
• Book appointments with doctors
• View and download medical reports
• Check doctor availability
• Get clinic information

**Important Notes:**
• I provide first aid guidance, not medical diagnosis
• Always consult a doctor for proper medical care
• For emergencies, call 911 immediately

What would you like help with today?`
  },

  thanks: {
    keywords: ['thank you', 'thanks', 'appreciate', 'helpful'],
    response: `You're welcome! I'm glad I could help. 😊

Remember:
• For emergencies, always call 911
• Consult with your doctor for medical advice
• I'm here 24/7 for guidance and support

Is there anything else I can help you with?

Stay healthy and take care!`
  }
};

module.exports = {
  EMERGENCY_KEYWORDS,
  FIRST_AID_RESPONSES,
  CLINIC_RESPONSES,
  GENERAL_RESPONSES,
  MEDICAL_DISCLAIMER
};
