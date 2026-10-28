# Lenses — storyboard (v2: one universal eye, Apple-minimal)

## Principles
- **One 3D object: the eye.** A single fixed, full-viewport R3F canvas (`eye/EyeCanvas.tsx`) mounted once in `App`. The eye is always the *final observer* at the end of every instrument.
- **Slots, not coordinates.** Each beat declares where the eye lives by rendering an `EyeSlot` (DOM box or an SVG anchor inside a 2D diagram) carrying the authored pose as data (`data-eye-slot`, `data-eye` JSON: rotation, cut-away, lens thickness, pupil, rays, focus offset, corrective lens, highlights, pulse). The canvas picks the visible slot nearest the viewport centre each frame (layout reads only), converts its rect to world space and **damps** toward the pose. No React state on the hot path; `frameloop="demand"` + `invalidate()` on scroll/resize and while damping. RTL mirrors the slot (layout), never the light direction.
- **One controller per pinned chapter** (`scroll/PinnedChapter.tsx`): one scrubbed GSAP timeline; integer beat → React (discrete pose/diagram state); text: previous out → visual moves → settle → text in → hold.
- **Modes**: pinned (≥1024px, motion) · stacked (<1024px: sticky diagram + step cards, no pins, eye smaller) · static (reduced motion / no WebGL / `?no3d=1`: every slot renders a static SVG eye; diagrams final state; all text visible).
- **Design**: black story sections, light (#f5f5f7) explanation/study sections; system/Inter type, centred headline blocks, one idea per screen; accent blue only for links/CTAs/active states; thin pale rays, amber only for focal points.

## Beats and eye poses
| chapter | beat | learner understands | stable | changes | eye slot / pose |
|---|---|---|---|---|---|
| Hero (pin 110vh) | H1 | "How do we see what we cannot touch?" | centred headline top | — | large, centre-bottom, **front-facing**, single beam entering pupil, pupil dilates with progress |
| | H2 | we are going inside | eye | headline fades up, eye grows slightly | same slot |
| Eye (pin 5 units) | E1 light enters | rays from object | text column | eye rotates 90° to **side profile + cut-away**, rays to cornea | visual column (end) |
| | E2 cornea | most refraction at air→cornea | | cornea highlighted | |
| | E3 lens | lens fine-tunes | | lens highlighted | |
| | E4 retina | image on retina, nerve to brain | | rays converge, retina + nerve pulse | |
| | E5 accommodation | muscles change lens shape | | lens thickens (near) | |
| Vision (pin 4 units) | V1 myopia | focus in front of retina | exact 2D diagram (end) | focal point in front | small eye under text (start), side + cut, focus −1 |
| | V2 + concave | lens moves image onto retina | | concave lens glides in, focus → retina | corrective −1 |
| | V3 hyperopia | focus behind retina | | focus +1 | |
| | V4 + convex | corrected | | convex lens glides in | corrective +1 |
| Camera (pin 4 units) | C1–C4 | aperture → one convex lens → mirror/prism to eye → shutter/sensor | 2D SLR schematic | rays/mirror/shutter per beat | **small at viewfinder anchor**, side; pupil contracts with aperture (C1) |
| Microscope (pin 1+4) | M0 | speck → cells (artistic zoom) | | scale | hidden |
| | M1–M4 | objective real image → eyepiece virtual image | exact 2D path | rays per beat | small at eyepiece end anchor |
| Telescope (pin 4) | T1–T4 | parallel rays → real image at F → eyepiece → inverted virtual image | exact 2D path | rays per beat | small at eyepiece end anchor |
| Binoculars (pin 3) | B1–B2 | objective inverts, prisms (TIR) re-invert | side view | path through prisms | at eyepiece anchor |
| | B3 | wider objective spacing → depth | top view | | **two eyes** (twin) behind both eyepieces |
| Finale | — | one lens, many worlds | centred | ray threads motifs | front-facing, centred above headline, calm |
| Study (light) | — | review / explore / quiz | | | eye fades out |

Every intermediate frame: the eye is either settled in a slot or damping between two slots over black space; diagrams are full compositions per beat; text never moves while readable.

Mobile: eye stays in the same slots (smaller); no pins; one beat per card. Reduced motion: static SVG eye in each slot, final diagrams, all text.
