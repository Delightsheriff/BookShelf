import { Animation } from '@expo/ui/swift-ui/modifiers';

/** Measured from the reference video (light-only design). */
export const colors = {
  background: '#F4F4F4',
  card: '#E9E9E9',
  field: '#FFFFFF',
  text: '#111111',
  secondary: '#7A7A7A',
  placeholder: '#3A3A3A',
  coverBorder: '#FFFFFF',
  tabBar: '#1B1B1D',
  tabIcon: '#8E8E93',
  tabIconActive: '#FFFFFF',
};

export const layout = {
  gutter: 16,
  cardRadius: 26,
  fieldHeight: 44,
};

/** Shared springs so every transition settles the same way. */
export const motion = {
  hero: Animation.spring({ response: 0.52, dampingFraction: 0.84 }),
  heroClose: Animation.spring({ response: 0.48, dampingFraction: 0.88 }),
  fadeIn: Animation.easeOut({ duration: 0.28 }),
  reveal: Animation.spring({ response: 0.5, dampingFraction: 0.9 }),
  fadeOut: Animation.easeOut({ duration: 0.16 }),
  stagger: (i: number) => Animation.spring({ response: 0.5, dampingFraction: 0.82 }).delay(0.06 + i * 0.07),
  tab: Animation.spring({ response: 0.36, dampingFraction: 0.78 }),
};
