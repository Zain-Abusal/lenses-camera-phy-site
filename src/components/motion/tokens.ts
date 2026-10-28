/**
 * One motion language for the whole site. framer-motion (seconds) and anime.js (ms) both read
 * from here so every entrance has the same curve, distance and rhythm.
 */

/** expo-out: fast start, long soft landing (Apple-like). anime.js equivalent: 'outExpo'. */
export const EASE = [0.16, 1, 0.3, 1] as const
export const ANIME_EASE = 'outExpo'

export const DUR = {
  /** blocks of text, cards, figures */
  block: 0.9,
  /** small items: list rows, chips, captions, step swaps */
  small: 0.5,
  /** headline words */
  words: 1.1,
}

export const RISE = { block: 24, small: 12 }
/** delay between siblings (lists, words) */
export const STAGGER = 0.06

/** Fade + rise on first view (framer-motion spread props). */
export const reveal = {
  initial: { opacity: 0, y: RISE.block },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-8% 0px' },
  transition: { duration: DUR.block, ease: EASE },
}

/** Swap animation for content that changes in place (step text, answers). */
export const swap = {
  initial: { opacity: 0, y: RISE.small },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -RISE.small / 2 },
  transition: { duration: DUR.small, ease: EASE },
}
