import { Image } from '@expo/ui/swift-ui';
import {
  aspectRatio,
  background,
  clipShape,
  frame,
  type ModifierConfig,
  padding,
  resizable,
  rotationEffect,
  shadow,
  shapes,
  zIndex,
} from '@expo/ui/swift-ui/modifiers';

import { imageUri } from '@/lib/covers';
import { colors } from '@/theme';

type Props = {
  bookId: string;
  width: number;
  height: number;
  /** Corner radius of the artwork; ~0 renders a sharp shelf cover. */
  radius?: number;
  /** White paper border around the artwork; 0 for none. */
  border?: number;
  rotation?: number;
  elevation?: 'none' | 'low' | 'high';
  z?: number;
  modifiers?: ModifierConfig[];
};

/** All cover art is 2:3; size slots with `coverHeight(width)`. */
export const COVER_RATIO = 2 / 3;
export const coverHeight = (width: number) => Math.round(width / COVER_RATIO);

const SHADOWS = {
  none: { radius: 0, y: 0, color: '#00000000' },
  low: { radius: 3, y: 2, color: '#00000026' },
  high: { radius: 10, y: 6, color: '#00000038' },
};

/**
 * Book cover.
 *
 * The modifier chain is structurally identical for every prop combination: Expo UI
 * rebuilds (rather than animates) a view whose list of modifiers changes shape, so a
 * cover flying from the bordered card fan to the bare shelf must only change values.
 */
export function Cover({
  bookId,
  width,
  height,
  radius = 7,
  border = 2.5,
  rotation = 0,
  elevation = 'low',
  z = 0,
  modifiers = [],
}: Props) {
  return (
    <Image
      uiImage={imageUri(bookId)}
      modifiers={[
        resizable(),
        aspectRatio({ ratio: COVER_RATIO, contentMode: 'fit' }),
        clipShape('roundedRectangle', Math.max(radius - border, 0)),
        padding({ all: border }),
        background(border > 0 ? colors.coverBorder : '#FFFFFF00', shapes.roundedRectangle({ cornerRadius: radius })),
        shadow(SHADOWS[elevation]),
        frame({ width, height }),
        rotationEffect(rotation),
        zIndex(z),
        ...modifiers,
      ]}
    />
  );
}
