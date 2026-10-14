/* eslint-disable react-hooks/refs */
import { HStack, Image, ScrollView, VStack, useNativeState } from '@expo/ui/swift-ui';
import {
  animation,
  frame,
  id,
  onAppear,
  onGeometryChange,
  onScrollPhaseChange,
  opacity,
  resizable,
  scrollClipDisabled,
  scrollPosition,
  scrollTargetBehavior,
  scrollTargetLayout,
  shadow,
} from '@expo/ui/swift-ui/modifiers';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';

import { Cover, coverHeight } from '@/components/Cover';
import { imageUri } from '@/lib/covers';
import { motion } from '@/theme';

import type { Rect } from './HeroLayer';

/** Shelf geometry from the reference: the middle cover sits on the screen's centre line. */
export const SHELF_COVER = 104;
export const SHELF_GAP = 40;
const PLANK = 14;
const COPIES = 3;

const keyOf = (copy: number, bookId: string) => `${copy}:${bookId}`;

type Props = {
  books: string[];
  contentIn: boolean;
  /** The first three books are drawn by the hero layer while it's in flight. */
  heroHidden: boolean;
  /** Reports the on-screen frame of the first three books (where the hero leaves from on close). */
  onHeroGeometry: (index: number, rect: Rect) => void;
  /** Reports the scroll view's frame; with the first book snapped to its leading edge this gives the landing spots. */
  onFrame: (rect: Rect) => void;
};

/**
 * Infinite shelf: the books are rendered three times and the scroll view starts
 * on the middle copy. When scrolling settles in an outer copy it silently
 * jumps to the same book in the middle copy, so the loop never runs out.
 */
export function Shelf({ books, contentIn, heroHidden, onHeroGeometry, onFrame }: Props) {
  // Scroll callbacks are handed to modifier factories during render but only run on
  // native scroll events, so the ref reads are safe; opt out of the compiler here.
  'use no memo';
  // Starts empty: SwiftUI ignores an initial scrollPosition, and re-setting the same value is a no-op.
  const position = useNativeState<string | null>(null);
  const current = useRef<string | null>(keyOf(1, books[0]));

  const recentre = () => {
    const key = current.current;
    if (!key) return;
    const [copy, bookId] = key.split(':');
    if (copy !== '1') {
      const next = keyOf(1, bookId);
      current.current = next;
      position.set(next);
    }
  };

  const height = coverHeight(SHELF_COVER);

  return (
    <VStack spacing={0}>
      <ScrollView
        axes="horizontal"
        showsIndicators={false}
        modifiers={[
          scrollTargetBehavior('viewAligned'),
          scrollPosition(position, {
            anchor: 'leading',
            onChange: (key) => {
              if (key && key !== current.current) {
                current.current = key;
                Haptics.selectionAsync();
              }
            },
          }),
          scrollClipDisabled(),
          onGeometryChange(onFrame),
          // Jump to the middle copy once on screen.
          onAppear(() => requestAnimationFrame(() => position.set(keyOf(1, books[0])))),
          onScrollPhaseChange((phase) => {
            if (phase === 'idle') recentre();
          }),
        ]}>
        <HStack spacing={SHELF_GAP} alignment="bottom" modifiers={[scrollTargetLayout()]}>
          {Array.from({ length: COPIES }, (_, copy) =>
            books.map((bookId, i) => (
              <Cover
                key={keyOf(copy, bookId)}
                bookId={bookId}
                width={SHELF_COVER}
                height={height}
                radius={1.5}
                border={0}
                elevation="low"
                modifiers={[
                  id(keyOf(copy, bookId)),
                  // While the hero is in flight the whole shelf is empty; the three heroes swap in
                  // instantly on landing and their neighbours fade in around them.
                  opacity(heroHidden ? 0 : 1),
                  ...(copy === 1 && i < 3
                    ? [onGeometryChange((r) => onHeroGeometry(i, r))]
                    : [animation(motion.fadeIn, heroHidden)]),
                ]}
              />
            )),
          )}
        </HStack>
      </ScrollView>

      <Image
        uiImage={imageUri('wood')}
        modifiers={[
          resizable(),
          frame({ maxWidth: Infinity, minHeight: PLANK, maxHeight: PLANK }),
          shadow({ radius: 7, y: 7, color: '#00000030' }),
          opacity(contentIn ? 1 : 0),
          animation(motion.fadeIn, contentIn),
        ]}
      />
    </VStack>
  );
}
