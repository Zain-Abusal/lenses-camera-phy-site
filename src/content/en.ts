// English content — based on the lesson
// "Unit 2: Refraction and Lenses · Section 3: Applications of Lenses" (pp. 48–51).
// Written for revision: key fact first, then why. **double asterisks** mark key terms.
import type { Content } from './types'

// Exam-ready facts, shared by each chapter's "remember" list and the study summary
// so students meet the same wording twice.
const eyeRemember = [
  'Light path: **cornea** → pupil → lens → **retina** → optic nerve → brain.',
  'The cornea does most of the refraction, because the index of refraction changes most at the air–cornea boundary.',
  '**Accommodation**: muscles change the shape of the lens, and so the focal length of the eye.',
  'Muscles relaxed → distant objects in focus. Muscles contracted → shorter focal length → near objects in focus.',
]
const visionRemember = [
  '**Nearsightedness** (myopia): focal length too short → image in front of the retina → distant objects blurry → concave lens.',
  '**Farsightedness** (hyperopia): focal length too long → image not formed on the retina → near objects blurry → convex lens.',
  'A concave lens increases the focal length; a convex lens decreases it.',
  'After about age 45 the eye’s lens becomes rigid, giving a similar result to farsightedness, also corrected with convex lenses.',
]
const cameraRemember = [
  'The lens system acts like a single **convex lens** and forms an **inverted** image.',
  'Shutter closed: mirror → prism → photographer’s eye. Shutter open: the mirror lifts and the image forms on the sensor.',
  'The **CCD** collects electric charge proportional to the light intensity, then sends the information to storage.',
  'To focus, the lens is moved: for a more distant object, move the lens closer to the sensor.',
]
const microscopeRemember = [
  'Two **convex** lenses with relatively small focal lengths: an objective and an eyepiece.',
  'Object between **F and 2F** of the objective → real, inverted, larger first image.',
  'That first image lies between the eyepiece and its focal point → virtual, larger final image.',
  'Final image: **inverted** relative to the object, and up to hundreds of times larger.',
]
const telescopeRemember = [
  'Object very far away → **parallel rays** → real, inverted first image at the focal point of the objective.',
  'The objective’s focal point lies between the eyepiece and the eyepiece’s focal point.',
  'The eyepiece forms a virtual final image, upright relative to the first image and larger, so the final image stays **inverted** relative to the object.',
  'The eyepiece is often an **achromatic lens**, which reduces coloured fringes (chromatic aberration).',
]
const binocularsRemember = [
  'Each side works like a small refracting telescope: the convex objective forms an inverted image.',
  'Two **prisms** invert the image again by **total internal reflection**, so the final image is upright.',
  'The prisms also lengthen the light path and direct it to the eyepiece.',
  'A larger distance between the two objective lenses improves the three-dimensional view.',
]

export const en: Content = {
  meta: {
    title: 'Lenses — Applications of Lenses',
    description:
      'An interactive scroll story about how lenses let us see: the eye, nearsightedness and farsightedness, cameras, the microscope, the refracting telescope and binoculars.',
  },
  ui: {
    wordmark: 'Lenses',
    menu: 'Menu',
    close: 'Close',
    chapters: 'Chapters',
    progress: 'Progress',
    langSwitch: 'ع',
    langSwitchLabel: 'Switch to Arabic',
    skip: 'Skip to content',
    schematic: 'Schematic',
    artistic: 'Artistic',
    model3d: '3D model — simplified',
    dragHint: 'Drag to rotate',
    toStudy: 'Go to study zone',
    step: 'Step',
    reducedMotion: 'Reduced motion is on — animations are simplified.',
    toTop: 'Back to top',
    previousChapter: 'Previous chapter',
    nextChapter: 'Next chapter',
    aids: {
      takeaway: 'The takeaway',
      remember: 'Remember',
      mistake: 'Common mistake',
      actually: 'Actually',
      terms: 'Key terms',
      workedExample: 'Worked examples',
      given: 'Given',
      solution: 'Solution',
      showStep: 'Show next step',
      showAll: 'Show all steps',
      answer: 'Answer',
      examTips: 'Exam tips',
      reset: 'Start again',
    },
  },
  chapterNames: {
    hero: 'Start',
    eye: 'The eye',
    vision: 'Vision defects',
    camera: 'Cameras',
    microscope: 'Microscope',
    telescope: 'Telescope',
    binoculars: 'Binoculars',
    finale: 'Finale',
    study: 'Study zone',
  },
  hero: {
    kicker: 'Section 3 · Applications of Lenses',
    title: 'How do we see what we cannot touch?',
    text: 'One idea, refraction, runs through your eye, your camera, a microscope and a telescope. Follow the light through each one.',
    cta: 'Begin the journey',
    scroll: 'Scroll',
    bigIdeaLabel: 'Main idea',
    bigIdea: 'Using lenses, people can see objects they would not otherwise be able to see.',
    questionsLabel: 'Essential questions',
    questions: [
      'How does the eye focus light to form an image?',
      'What are nearsightedness and farsightedness, and how can eyeglass lenses correct these defects?',
      'What are the properties of the optical systems in some common optical devices?',
    ],
  },
  eye: {
    num: '01',
    kicker: 'Chapter 01',
    title: 'Lenses in the Eye',
    intro:
      'Your eye bends light into an image, and the lens is not what does most of the bending.',
    steps: [
      {
        title: 'Light enters through cornea and pupil',
        body: 'Light enters through the **cornea** and the **pupil**.',
      },
      {
        title: 'The cornea does most of the bending',
        body: 'Air (n = 1.00) → cornea (n ≈ 1.4): the biggest jump in **index of refraction**, so the most bending.',
      },
      {
        title: 'The lens only fine-tunes the focus',
        body: 'The **lens** changes shape to fine-tune the focus.',
      },
      {
        title: 'The image lands on the retina',
        body: 'The image forms on the **retina**; the **optic nerve** sends it to the brain.',
      },
    ],
    takeaway:
      'The cornea does most of the refracting; the lens fine-tunes the focus by changing shape, so the image lands on the retina.',
    remember: eyeRemember,
    mistake: {
      wrong: 'The eye’s lens does most of the focusing. That’s why it’s called a lens.',
      right:
        'The **cornea** does most of it, because the biggest change in index of refraction is at the air–cornea boundary. The lens only fine-tunes.',
    },
    terms: [
      {
        term: 'Index of refraction',
        def: 'For any medium: the ratio of the speed of light in a vacuum to the speed of light in that medium.',
      },
      { term: 'Cornea', def: 'The front of the eye where light enters and where most of the refraction happens.' },
      { term: 'Retina', def: 'The layer at the back of the eye where the image forms; its cells absorb the light.' },
      { term: 'Optic nerve', def: 'Carries information about the image from the retina to the brain.' },
      {
        term: 'Accommodation',
        def: 'Muscles change the shape of the lens, and so its focal length, to focus near or distant objects.',
      },
    ],
    labels: {
      cornea: 'Cornea',
      pupil: 'Pupil',
      lens: 'Lens',
      muscles: 'Muscles',
      retina: 'Retina',
      nerve: 'Optic nerve',
      image: 'Image',
      light: 'Light',
    },
    exploreTitle: 'Explore the eye',
    exploreHint: 'Select a part of the eye to learn what it does.',
    parts: {
      cornea: {
        name: 'Cornea',
        body: 'Does **most of the refraction** in the eye, because the difference in index of refraction between air and the cornea is large.',
      },
      pupil: {
        name: 'Pupil',
        body: 'The opening behind the cornea. Light enters the eye through the cornea and the pupil.',
      },
      lens: {
        name: 'Lens',
        body: 'Fine-tunes the focus. Its shape, and so its **focal length**, can change, which lets you see both near and distant objects clearly.',
      },
      muscles: {
        name: 'Muscles around the lens',
        body: 'They contract or relax to change the lens shape and the eye’s focal length. This is **accommodation**.',
      },
      retina: {
        name: 'Retina',
        body: 'At the back of the eye. The image is focused here, and specialized cells absorb the light.',
      },
      nerve: {
        name: 'Optic nerve',
        body: 'Carries information about the image from the retina to the brain.',
      },
    },
    accommodation: {
      title: 'Accommodation',
      body: 'Muscles relax for distant objects and contract (shorter **focal length**) for near ones.',
      far: 'Distant object',
      near: 'Near object',
      relaxed: 'Muscles relaxed',
      contracted: 'Muscles contracted — shorter focal length',
      caption: 'Nearer object → muscles contract → shorter focal length.',
    },
    contactLenses: {
      title: 'Physics in your life: contact lenses',
      body: 'Contact lenses do the same job as eyeglasses. They sit directly on the cornea, held in place by a thin layer of tears. Most of the refraction happens at the air–lens boundary, where the difference in index of refraction is large.',
    },
  },
  vision: {
    num: '02',
    kicker: 'Chapter 02 · Nearsightedness and farsightedness',
    title: 'Not everything we see is clear.',
    intro:
      'When the image misses the retina, glasses change the focal length to put it back.',
    myopia: 'Nearsightedness',
    hyperopia: 'Farsightedness',
    withLens: 'With corrective lens',
    withoutLens: 'Without lens',
    states: {
      myopia: {
        alias: 'Also known as myopia',
        cause: 'The focal length of the eye is too short.',
        result: 'The rays meet before they reach the retina, so images form **in front of** it.',
        symptom: 'Distant objects look blurry; near objects are clear.',
        fix: 'A **concave lens** spreads the rays, increasing the focal length.',
        fixed: 'The image now forms on the retina.',
        lensName: 'Concave lens',
      },
      hyperopia: {
        alias: 'Also known as hyperopia',
        cause: 'The focal length of the eye is longer than in a healthy eye.',
        result: 'Light reaches the retina **before** the image can form, so the image is not formed on the retina.',
        symptom: 'Near objects look blurry.',
        fix: 'A **convex lens** converges the rays, decreasing the focal length.',
        fixed: 'The image now forms on the retina.',
        lensName: 'Convex lens',
      },
    },
    ageNote:
      'After about 45 the lens stiffens: like farsightedness, fixed with convex lenses.',
    retina: 'Retina',
    focus: 'Image',
    blur: 'Blurry',
    caption:
      'Concave lens: increases the focal length → corrects nearsightedness. Convex lens: decreases the focal length → corrects farsightedness.',
    takeaway:
      'Nearsighted: focal length too short, so use a concave lens. Farsighted: focal length too long, so use a convex lens.',
    remember: visionRemember,
    mistake: {
      wrong: 'Nearsighted people can’t see near things, so they need a convex (magnifying) lens.',
      right:
        'Nearsighted people see **near** objects clearly; **distant** objects blur. Their focal length is too short, so they need a **concave** lens. Convex lenses are for farsightedness.',
    },
    terms: [
      { term: 'Nearsightedness (myopia)', def: 'The eye’s focal length is too short; images form in front of the retina.' },
      {
        term: 'Farsightedness (hyperopia)',
        def: 'The eye’s focal length is too long; images are not formed on the retina, so near objects blur.',
      },
      { term: 'Concave lens', def: 'A lens that diverges (spreads out) light; used to correct nearsightedness.' },
      { term: 'Convex lens', def: 'A lens that converges (brings together) light; used to correct farsightedness.' },
    ],
  },
  camera: {
    num: '03',
    kicker: 'Chapter 03',
    title: 'Cameras',
    intro:
      'A reflex camera works like the eye, using lenses, a mirror and a prism.',
    steps: [
      {
        title: 'Light enters through the aperture',
        body: 'Light enters through the **aperture** and an **achromatic lens**.',
      },
      {
        title: 'The lenses act as one convex lens',
        body: 'They form an **inverted** image; mirror and prism send it to your eye.',
      },
      {
        title: 'The shutter release lifts the mirror',
        body: 'The mirror lifts and the image forms on the **image sensor**.',
      },
      {
        title: 'A CCD turns light into charge',
        body: 'A **CCD** stores charge proportional to light intensity.',
      },
    ],
    takeaway:
      'A camera’s lens system works like one convex lens: it forms an inverted image on the sensor, and a CCD records it as electric charge.',
    remember: cameraRemember,
    mistake: {
      wrong: 'A camera focuses by changing the shape of its lens, just like the eye.',
      right:
        'The camera lens is **moved** (adjusted) relative to the sensor. Only the eye changes the shape of its lens, through accommodation.',
    },
    terms: [
      { term: 'Aperture', def: 'The opening through which light enters the camera lens.' },
      { term: 'Achromatic lens', def: 'A group of lenses that work as one lens and reduce coloured fringes (chromatic aberration).' },
      { term: 'Image sensor', def: 'The surface where the camera forms its image when the shutter is open.' },
      {
        term: 'Charge-coupled device (CCD)',
        def: 'A sensor that collects image information as electric charge proportional to the light intensity.',
      },
    ],
    labels: {
      object: 'Object',
      aperture: 'Aperture',
      lens: 'Lens',
      mirror: 'Mirror',
      prism: 'Prism',
      viewfinder: 'To the eye',
      shutterClosed: 'Shutter closed',
      shutterOpen: 'Shutter open',
      sensor: 'Image sensor',
      image: 'Image',
    },
    shutterToggle: { closed: 'Shutter closed', open: 'Shutter open', title: 'Press the shutter release' },
    ccd: {
      title: 'Charge-coupled device (CCD)',
      body: 'Collects electric charge **proportional to the light intensity**, then sends it to storage.',
    },
    focusTitle: 'Focusing on the sensor',
    focusBody:
      'The image must land exactly on the sensor. A more distant object forms its image closer to the lens, so the lens is **moved closer to the sensor**.',
    objectLabel: 'Object distance',
    lensLabel: 'Lens position',
    near: 'Near',
    far: 'Far',
    sharp: 'Sharp',
    soft: 'Blurry',
    focusCaption: 'The camera lens can be adjusted to focus the image on the image sensor. When the shutter is closed, the mirror redirects the image to the viewer’s eye.',
    compareTitle: 'The eye and the camera',
    compareHead: { aspect: 'Feature', eye: 'Eye', camera: 'Camera' },
    compare: [
      {
        aspect: 'Light enters through',
        eye: 'The cornea and the pupil',
        camera: 'The lens aperture',
      },
      {
        aspect: 'Lenses',
        eye: 'The cornea does most of the refraction; the lens fine-tunes the focus',
        camera: 'A lens system that acts like a single convex lens',
      },
      {
        aspect: 'Focusing',
        eye: 'Muscles change the shape of the lens, changing its focal length (accommodation)',
        camera: 'The lens is adjusted (moved) to focus the image on the sensor',
      },
      {
        aspect: 'Where the image forms',
        eye: 'On the retina',
        camera: 'On the sensor when the shutter is open; the viewfinder directs it to the eye when closed',
      },
      {
        aspect: 'Recording the image',
        eye: 'Retina cells absorb the light; the optic nerve sends the information to the brain',
        camera: 'A CCD collects electric charge proportional to light intensity and sends it to storage',
      },
    ],
  },
  microscope: {
    num: '04',
    kicker: 'Chapter 04',
    title: 'The Compound Microscope',
    intro: 'Two convex lenses magnify tiny objects in two stages.',
    steps: [
      {
        title: 'Two convex lenses, short focal lengths',
        body: 'An **objective** and an **eyepiece**, each magnifying in turn.',
      },
      {
        title: 'Objective: the first image',
        body: 'Object **between F and 2F** → real, inverted, larger **first image**.',
      },
      {
        title: 'Eyepiece: the final image',
        body: 'The eyepiece magnifies it into a **virtual** **final image**.',
      },
      {
        title: 'Final image: inverted and huge',
        body: 'Still **inverted**, and up to hundreds of times larger.',
      },
    ],
    takeaway:
      'The objective forms a real, inverted, enlarged first image; the eyepiece magnifies it into a virtual final image that is still inverted.',
    remember: microscopeRemember,
    mistake: {
      wrong: 'The eyepiece turns the image the right way up, so a microscope shows things upright.',
      right:
        'The eyepiece’s image is upright only relative to the objective’s image, which is already inverted. So the final image stays **inverted**.',
    },
    terms: [
      { term: 'Objective lens', def: 'The lens nearest the object; it forms the first, real image.' },
      { term: 'Eyepiece lens', def: 'The lens you look through; it magnifies the first image into a virtual image.' },
      { term: 'Real image', def: 'An image formed where light rays actually meet, like the objective’s image.' },
      { term: 'Virtual image', def: 'An image that light rays only appear to come from, like the image seen in the eyepiece.' },
    ],
    zoomNote: 'Images can be hundreds of times larger than the objects placed in the microscope.',
    labels: {
      object: 'Object',
      objective: 'Objective lens',
      eyepiece: 'Eyepiece lens',
      real: 'Real image',
      virtual: 'Virtual image',
      F: 'F',
      twoF: '2F',
      lamp: 'Lamp',
      condenser: 'Light lens',
      slide: 'Specimen on slide',
    },
    demoTitle: 'Place the specimen',
    demoBody: 'Move the object between F and 2F of the objective lens and watch the real, inverted image it forms.',
    demoLabel: 'Object distance from the objective',
    demoReadout: 'Objective magnification',
    demoCaption: 'The objective and eyepiece lenses of the compound microscope form an image that is inverted and larger compared with the object.',
  },
  telescope: {
    num: '05',
    kicker: 'Chapter 05',
    title: 'The Refracting Telescope',
    intro:
      'Starlight arrives as parallel rays; two lenses turn it into a magnified image.',
    steps: [
      {
        title: 'Starlight arrives as parallel rays',
        body: 'Distant stars send **parallel** rays.',
      },
      {
        title: 'Objective: the first image',
        body: 'The **objective** forms a **real**, inverted **first image** at its focal point.',
      },
      {
        title: 'Eyepiece: the final image',
        body: 'The eyepiece magnifies it into a **virtual** **final image**.',
      },
      {
        title: 'Inverted, and that’s acceptable',
        body: 'The final image stays **inverted**, which is fine for stars.',
      },
    ],
    takeaway:
      'Parallel rays form a real, inverted first image at the objective’s focal point; the eyepiece magnifies it, so the final image stays inverted.',
    remember: telescopeRemember,
    mistake: {
      wrong: 'A telescope’s upside-down image is a defect that has to be fixed.',
      right:
        'An inverted image is **acceptable** for viewing celestial objects. Binoculars, used for things on Earth, add prisms to make the image upright.',
    },
    terms: [
      {
        term: 'Refracting telescope',
        def: 'A telescope that uses lenses (a convex objective and a convex eyepiece) to make distant objects look larger.',
      },
      { term: 'Objective lens', def: 'The front lens; it forms a real, inverted image at its focal point.' },
      { term: 'Eyepiece lens', def: 'The lens you look through; it magnifies the objective’s image.' },
      { term: 'Achromatic lens', def: 'A group of lenses acting as one lens that reduces chromatic aberration.' },
      { term: 'Chromatic aberration', def: 'Coloured fringes that form around images made by a lens.' },
    ],
    labels: {
      rays: 'Light from a distant object',
      objective: 'Objective lens',
      eyepiece: 'Eyepiece lens',
      real: 'Real image of a distant object',
      virtual: 'Virtual image',
      focal: 'Focal point',
    },
    achromatic: {
      title: 'Achromatic eyepiece',
      body: 'Often an **achromatic lens**, which removes coloured fringes (**chromatic aberration**).',
    },
    viewTitle: 'Through the eyepiece',
    viewObject: 'Object',
    viewImage: 'Final image — inverted',
  },
  binoculars: {
    num: '06',
    kicker: 'Chapter 06',
    title: 'Binoculars',
    intro:
      'Two small telescopes side by side, with prisms that make the image upright.',
    steps: [
      {
        title: 'Objective: an inverted image',
        body: 'The **objective** forms an **inverted** image, as in a telescope.',
      },
      {
        title: 'Prisms flip the image upright',
        body: 'Two **prisms** flip it upright by **total internal reflection**.',
      },
      {
        title: 'Wider spacing gives better depth',
        body: 'Objectives farther apart give a better **3D view**.',
      },
    ],
    takeaway:
      'Binoculars are two small telescopes whose prisms use total internal reflection to turn the inverted image upright.',
    remember: binocularsRemember,
    mistake: {
      wrong: 'The prisms in binoculars are what magnify the image.',
      right:
        'The **lenses** magnify. The prisms flip the image upright by total internal reflection, lengthen the light path and space the objectives farther apart.',
    },
    terms: [
      { term: 'Prism', def: 'An optical element that redirects light; in binoculars, two prisms flip the image upright.' },
      {
        term: 'Total internal reflection',
        def: 'Light reflecting completely inside the prism instead of passing out of it.',
      },
      { term: 'Objective lens', def: 'The convex front lens on each side; it forms an inverted image.' },
    ],
    labels: {
      objective: 'Objective lens',
      prism: 'Prism',
      eyepiece: 'Eyepiece lens',
      focusKnob: 'Focus knob',
    },
  },
  finale: {
    kicker: 'Finale',
    title: 'Every lens opens a new window.',
    text: 'One rule, light bends when it changes medium, explains all of it.',
    cta: 'Test yourself',
    items: {
      eye: 'The eye: the cornea does most of the focusing; the lens fine-tunes it onto the retina.',
      camera: 'The camera: a lens system acts as one convex lens and forms an inverted image on the sensor.',
      microscope: 'The microscope: two convex lenses make small objects hundreds of times larger; the image is inverted.',
      telescope: 'The telescope: the objective forms a real image at its focal point, the eyepiece magnifies it, and the final image stays inverted.',
      binoculars: 'Binoculars: prisms flip the image upright by total internal reflection and add depth.',
    },
  },
  study: {
    kicker: 'Study zone',
    title: 'Review, explore, test yourself',
    intro: 'Explore optics, solve problems, and test your understanding.',
    tabs: { explore: 'Explore', compare: 'Compare', quiz: 'Quiz', summary: 'Summary', progress: 'Progress', examples: 'Examples' },
    explore: {
      title: 'Interactive explorations',
      items: [
        {
          id: 'snell',
          name: 'Refraction at the cornea',
          body: 'Use Snell’s law to see how much light bends entering a cornea (n ≈ 1.4) from air or from water, and why vision underwater is blurry.',
        },
        {
          id: 'accommodation',
          name: 'Accommodation',
          body: 'Change the shape of the eye’s lens to bring near and distant objects into focus on the retina.',
        },
        {
          id: 'vision',
          name: 'Correcting vision',
          body: 'See where images form in nearsighted and farsighted eyes, and how concave and convex lenses move them onto the retina.',
        },
        {
          id: 'focus',
          name: 'Camera focus',
          body: 'Move the camera lens to focus objects at different distances on the image sensor.',
        },
        {
          id: 'microscope',
          name: 'Microscope',
          body: 'Place an object between F and 2F of the objective and follow the image through the eyepiece.',
        },
        {
          id: 'telescope',
          name: 'Refracting telescope',
          body: 'Trace parallel rays from a distant star through the objective and eyepiece lenses.',
        },
      ],
      snell: {
        incidence: 'Angle of incidence',
        medium1: 'Light comes from',
        air: 'Air (n = 1.00)',
        water: 'Water (n = 1.33)',
        corneaIndex: 'Cornea (n ≈ 1.4)',
        refraction: 'Angle of refraction',
        caption:
          'Snell’s law: n₁ sin θ₁ = n₂ sin θ₂. At 30.0° from air, light bends to about 20.9°. From water (n = 1.33, a standard value) the index difference is smaller, so it bends only to about 28.4°. The cornea barely focuses underwater, which is why vision there is blurry.',
      },
    },
    compareTable: {
      head: ['', 'Nearsightedness (myopia)', 'Farsightedness (hyperopia)'],
      rows: [
        ['Focal length', 'Too short', 'Too long (larger than in a healthy eye)'],
        ['Where the image forms', 'In front of the retina', 'Not on the retina: light reaches the retina before the image forms'],
        ['What looks blurry', 'Distant objects', 'Near objects'],
        ['Corrective lens', 'Concave lens', 'Convex lens'],
        [
          'How it corrects',
          'Diverges the light, increasing the focal length, so the image moves back onto the retina',
          'Forms a virtual image farther from the eye, which the eye’s lens focuses on the retina (decreases the focal length)',
        ],
        ['Note', '—', 'Lens rigidity after about age 45 gives a similar result'],
      ],
    },
    quiz: {
      title: 'Quiz',
      questions: [
        {
          q: 'Where does most of the focusing of light in the eye take place?',
          options: ['At the lens', 'At the cornea', 'At the retina', 'At the optic nerve'],
          answer: 1,
          why: 'Light bends most where the index of refraction changes most, and that is the air–cornea boundary, not the lens.',
        },
        {
          q: 'What happens during accommodation?',
          options: [
            'The pupil changes the colour of the light',
            'The cornea moves closer to the retina',
            'Muscles change the shape of the lens, changing the eye’s focal length',
            'The retina moves forward toward the lens',
          ],
          answer: 2,
          why: 'Accommodation means the lens changes shape: the muscles contract or relax, and the new shape gives the eye a new focal length.',
        },
        {
          q: 'In a healthy eye, what lets images of near objects focus on the retina?',
          options: [
            'The muscles relax, so the focal length gets longer',
            'The muscles contract, so the focal length gets shorter',
            'The cornea becomes flatter',
            'The pupil becomes larger',
          ],
          answer: 1,
          why: 'Near objects need more bending, so the muscles contract and shorten the focal length; relaxed muscles are for distant objects.',
        },
        {
          q: 'In a nearsighted eye, where do images form?',
          options: ['On the retina', 'Behind the retina', 'In front of the retina', 'On the cornea'],
          answer: 2,
          why: 'The focal length is too short, so light comes to a focus before it reaches the retina, in front of it.',
        },
        {
          q: 'Which lens corrects nearsightedness?',
          options: ['A convex lens', 'A concave lens', 'An achromatic lens', 'A prism'],
          answer: 1,
          why: 'A concave lens diverges the light, which increases the image distance and moves the image back onto the retina.',
        },
        {
          q: 'A farsighted person sees which objects as blurry?',
          options: ['Near objects', 'Distant objects', 'All objects', 'Only bright objects'],
          answer: 0,
          why: 'The focal length is too long to focus near objects on the retina; distant objects are still clear.',
        },
        {
          q: 'Why do many people over about 45 have trouble focusing on near objects?',
          options: [
            'Their corneas become thicker',
            'The lens becomes more rigid, so the muscles cannot shorten the focal length enough',
            'Their pupils stop letting light in',
            'Their optic nerves become shorter',
          ],
          answer: 1,
          why: 'A rigid lens can’t change shape enough, so the focal length can’t get short enough for near objects, like farsightedness.',
        },
        {
          q: 'In a refracting telescope, where does the objective lens form the image of a distant star?',
          options: [
            'At the focal point of the objective, as a real, inverted image',
            'At the eyepiece, as a virtual, upright image',
            'At twice the focal length of the objective, as a real, upright image',
            'At twice the focal length of the eyepiece',
          ],
          answer: 0,
          why: 'Rays from a very distant star arrive parallel, and parallel rays through a convex lens meet at its focal point as a real, inverted image.',
        },
        {
          q: 'Why is the eyepiece of a telescope often an achromatic lens?',
          options: [
            'To flip the image upright',
            'To make the telescope lighter',
            'To reduce coloured fringes (chromatic aberration) in the image',
            'To reflect the light to the viewer’s eye',
          ],
          answer: 2,
          why: 'An achromatic lens is a group of lenses acting as one, designed to remove the coloured fringes a single lens adds to images.',
        },
        {
          q: 'In a single-lens reflex camera with the shutter closed, what sends the image to the photographer’s eye?',
          options: ['The image sensor', 'The mirror and the prism', 'The aperture alone', 'The CCD'],
          answer: 1,
          why: 'With the shutter closed the mirror is down, so it reflects the image up to the prism, which redirects it to the eye.',
        },
        {
          q: 'How does a CCD collect image information?',
          options: [
            'As heat proportional to the colour of the light',
            'As electric charge proportional to the intensity of the light',
            'As a reflection on a mirror',
            'As a chemical change in film',
          ],
          answer: 1,
          why: 'Each light-sensitive spot builds up electric charge in proportion to how intense the light is, so the charge pattern matches the image.',
        },
        {
          q: 'In binoculars, what turns the inverted image upright again?',
          options: [
            'A concave lens',
            'Two prisms using total internal reflection',
            'The focus knob',
            'A second objective lens',
          ],
          answer: 1,
          why: 'The objective inverts the image as in a telescope; two prisms reflect it internally and invert it again, so it ends up upright.',
        },
      ],
      correct: 'Correct!',
      wrong: 'Not quite.',
      next: 'Next question',
      finish: 'See results',
      score: 'Your score',
      retry: 'Try again',
      of: 'of',
    },
    review: {
      title: 'Section 3 review',
      items: [
        {
          q: '33. Main idea — Which type of lens, convex or concave, should a nearsighted person use? Which type should a farsighted person use? (Figure 28) Explain.',
          a: 'Nearsighted: a **concave** lens. The focal length is too short and the image forms in front of the retina; the concave lens diverges the light, moving the image back onto the retina. Farsighted: a **convex** lens. The focal length is too long; the convex lens forms a virtual image farther away, which the eye can then focus on the retina.',
        },
        {
          q: '34. Refraction — Explain why the cornea is the main element that converges light rays in the eye.',
          a: 'Refraction depends on the difference in index of refraction. The biggest difference is at the **air–cornea boundary** (1.00 → about 1.4), so most bending happens there. The lens only fine-tunes the focus.',
        },
        {
          q: '35. Camera — You point a camera at a tree 2 m away, then at a tree farther away. Should the lens move closer to the sensor or farther from it?',
          a: '**Closer to the sensor.** A more distant object forms its image closer to the lens (nearer its focal point), so the lens must move toward the sensor to keep the image focused on it.',
        },
        {
          q: '36. Critical thinking — At the highest magnification, microscope images are darker than at low magnification. What are the likely reasons, and what can you do to get a clearer image?',
          a: 'Likely because the light from a tiny area of the specimen is **spread over a much larger image**, so each part of the image gets less light. To improve it, increase the illumination: use a brighter lamp and adjust the light lens to concentrate more light on the specimen.',
        },
      ],
    },
    workedExamples: [
      {
        title: 'Part 1 — Light entering the cornea from air',
        problem:
          'A ray of light enters the eye at 30.0° to the normal. The index of refraction of the cornea is about 1.4. Use Snell’s law to find the angle of refraction.',
        given: ['n₁ = 1.00 (air)', 'n₂ ≈ 1.4 (cornea)', 'θ₁ = 30.0°'],
        steps: [
          'Snell’s law: n₁ sin θ₁ = n₂ sin θ₂',
          'sin θ₂ = (n₁ sin θ₁) / n₂ = (1.00 × sin 30.0°) / 1.4',
          'sin θ₂ = (1.00 × 0.500) / 1.4 = 0.357',
          'θ₂ = sin⁻¹(0.357)',
        ],
        answer: 'θ₂ ≈ 20.9°. The ray bends 9.1° toward the normal.',
      },
      {
        title: 'Part 2 — The same ray for a swimmer underwater',
        problem:
          'What is the angle of refraction for the same angle of incidence if the person is swimming underwater with eyes open?',
        given: [
          'n₁ = 1.33 (water — a standard value, assumed; it is not printed in the lesson)',
          'n₂ ≈ 1.4 (cornea)',
          'θ₁ = 30.0°',
        ],
        steps: [
          'sin θ₂ = (n₁ sin θ₁) / n₂ = (1.33 × sin 30.0°) / 1.4',
          'sin θ₂ = (1.33 × 0.500) / 1.4 = 0.475',
          'θ₂ = sin⁻¹(0.475)',
        ],
        answer: 'θ₂ ≈ 28.4°. The ray bends only 1.6° toward the normal.',
      },
      {
        title: 'Part 3 — Is refraction greater in air or in water?',
        problem: 'Compare the refraction at the cornea in air and in water. What does this mean for the eye?',
        given: ['In air: θ₂ ≈ 20.9° (from Part 1)', 'In water: θ₂ ≈ 28.4° (from Part 2)'],
        steps: [
          'Bending in air: θ₁ − θ₂ = 30.0° − 20.9° = 9.1°',
          'Bending in water: θ₁ − θ₂ = 30.0° − 28.4° = 1.6°',
          'Index difference, air to cornea: n₂ − n₁ = 1.4 − 1.00 = 0.4; water to cornea: n₂ − n₁ = 1.4 − 1.33 = 0.07',
          'A larger index difference gives more bending.',
        ],
        answer:
          'Refraction is **greater in air**. Underwater the cornea bends light very little, so the eye can’t focus the image on the retina — this is why vision underwater is blurry.',
      },
      {
        title: 'Part 4 — Matching the refraction in air',
        problem:
          'If you want the angle of refraction in water to equal the one in air (20.9°), what must the new angle of incidence be?',
        given: ['n₁ = 1.33 (water, assumed)', 'n₂ ≈ 1.4 (cornea)', 'θ₂ = 20.9° (from Part 1)'],
        steps: [
          'n₁ sin θ₁ = n₂ sin θ₂ → sin θ₁ = (n₂ sin θ₂) / n₁',
          'sin θ₁ = (1.4 × sin 20.9°) / 1.33',
          'n₂ sin θ₂ = 1.4 × sin 20.9° = 0.500 (the same value as n₁ sin θ₁ in Part 1)',
          'sin θ₁ = 0.500 / 1.33 = 0.376',
          'θ₁ = sin⁻¹(0.376)',
        ],
        answer: 'θ₁ ≈ 22.1°',
      },
    ],
    examTips: [
      '**Concave ↔ nearsighted** (myopia, image in front of the retina). **Convex ↔ farsighted** (hyperopia, near objects blurry).',
      'Asked why the cornea focuses most? Give the cause: the large difference in index of refraction at the air–cornea boundary. “The lens” is the classic wrong answer.',
      'Accommodation: muscles **contract** → focal length shorter → near objects in focus. Muscles relax → distant objects in focus.',
      'Telescope: object very far → **parallel rays** → real, inverted image at F of the objective.',
      'Microscope: object **between F and 2F** of the objective → real, inverted, larger image.',
      'The final image in both the telescope and the microscope is **inverted**. Binoculars use prisms to make it upright.',
      'Snell’s law: measure angles from the **normal**, not the surface, and keep 3 significant figures.',
    ],
    summary: [
      { title: 'Lenses in the eye', body: eyeRemember },
      {
        title: 'Nearsightedness and farsightedness',
        body: [...visionRemember, 'Contact lenses do the same job as eyeglasses and sit directly on the cornea.'],
      },
      { title: 'Cameras', body: cameraRemember },
      { title: 'The microscope', body: microscopeRemember },
      { title: 'The refracting telescope', body: telescopeRemember },
      { title: 'Binoculars', body: binocularsRemember },
    ],
    progress: {
      chapters: 'Chapters',
      visited: 'Visited',
      notVisited: 'Not visited yet',
      quizBest: 'Best quiz score',
      noQuiz: 'No quiz attempts yet',
      reset: 'Reset progress',
      note: 'Progress is saved only in this browser.',
    },
  },
  footer: {
    source: 'Source: Unit 2: Refraction and Lenses — Section 3: Applications of Lenses, pp. 48–51.',
    note: 'An interactive study companion. Diagrams are simplified and not to scale.',
    credit: 'Made by',
  },
}
