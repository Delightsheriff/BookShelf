import { ZStack } from '@expo/ui/swift-ui';
import { animation, frame, offset, onAppear, rotationEffect, zIndex } from '@expo/ui/swift-ui/modifiers';

import { Cover } from '@/components/Cover';
import { motion } from '@/theme';

export type Rect = { x: number; y: number; width: number; height: number };

export type CoverPose = Rect & { rotation: number; border: number; radius: number };

export type Flight = { bookId: string; from: CoverPose; to: CoverPose }[];

type Props = {
  flight: Flight | null;
  /** false = covers sit at `from`, true = at `to`. Changing it springs them across. */
  atTarget: boolean;
  /** Global origin of this layer, so global rects can be turned into local offsets. */
  origin: { x: number; y: number };
  /** Fires once the covers are on screen at their start pose — only then may they move. */
  onReady?: () => void;
};

/**
 * The shared-element layer. Expo UI animates modifier changes but not view
 * insertion/removal, so instead of SwiftUI's matchedGeometryEffect the three
 * covers are drawn here, above everything, and flown between the card fan and
 * the shelf by animating their frame, offset and rotation.
 */
export function HeroLayer({ flight, atTarget, origin, onReady }: Props) {
  return (
    <ZStack
      alignment="topLeading"
      modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'topLeading' }), zIndex(10)]}>
      {flight?.map(({ bookId, from, to }, i) => {
        const p = atTarget ? to : from;
        return (
          <Cover
            key={bookId}
            bookId={bookId}
            width={p.width}
            height={p.height}
            border={p.border}
            radius={p.radius}
            elevation="low"
            modifiers={[
              rotationEffect(p.rotation),
              offset({ x: p.x - origin.x, y: p.y - origin.y }),
              zIndex(i),
              ...(i === 0 && onReady ? [onAppear(onReady)] : []),
              // Slight stagger so the fan peels apart rather than moving as one block.
              animation(atTarget ? motion.hero.delay(i * 0.025) : motion.heroClose.delay((2 - i) * 0.02), atTarget),
            ]}
          />
        );
      })}
    </ZStack>
  );
}
