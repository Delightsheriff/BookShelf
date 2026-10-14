/* eslint-disable react-hooks/refs */
import { Capsule, HStack, Rectangle, ScrollView, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  animation,
  font,
  foregroundStyle,
  frame,
  ignoreSafeArea,
  offset,
  onScrollPhaseChange,
  onTapGesture,
  opacity,
  padding,
  useScrollGeometryChange,
} from '@expo/ui/swift-ui/modifiers';
import { useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Cover, coverHeight } from '@/components/Cover';
import { SearchRow } from '@/components/SearchRow';
import type { Collection } from '@/data/books';
import { colors, motion } from '@/theme';

import type { Rect } from './HeroLayer';
import { Shelf } from './Shelf';

const GRID_GUTTER = 24;
const GRID_GAP = 28;
/** How far past the top the sheet must be pulled before letting go dismisses it. */
const DISMISS_PULL = 72;

type Props = {
  collection: Collection;
  contentIn: boolean;
  heroHidden: boolean;
  onHeroGeometry: (index: number, rect: Rect) => void;
  onShelfFrame: (rect: Rect) => void;
  onClose: () => void;
};

export function CollectionDetail({ collection, contentIn, heroHidden, onHeroGeometry, onShelfFrame, onClose }: Props) {
  // Scroll callbacks are handed to modifier factories during render but only run on
  // native scroll events, so the ref reads are safe; opt out of the compiler here.
  'use no memo';
  const { width } = useWindowDimensions();
  const gridCover = Math.floor((width - GRID_GUTTER * 2 - GRID_GAP) / 2);

  // Pull-down-to-dismiss: remember the resting offset, close when released far enough above it.
  // At rest the content offset sits at minus the top safe-area inset.
  const rest = -useSafeAreaInsets().top;
  const lastY = useRef(0);
  const dragging = useRef(false);
  const onGeometry = useScrollGeometryChange((g) => {
    lastY.current = g.contentOffsetY;
  });

  // Secondary content fades and rises in after the hero covers have taken off.
  // On the way out everything fades together and fast, before the covers land.
  const reveal = (rise: number, delay = 0) => [
    opacity(contentIn ? 1 : 0),
    offset({ y: contentIn ? 0 : rise }),
    animation(contentIn ? motion.reveal.delay(delay) : motion.fadeOut, contentIn),
  ];

  const rows: string[][] = [];
  for (let i = 0; i < collection.books.length; i += 2) rows.push(collection.books.slice(i, i + 2));

  return (
    <ZStack alignment="top" modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'top' })]}>
      <Rectangle modifiers={[foregroundStyle(colors.background), ignoreSafeArea()]} />
      <ScrollView
        showsIndicators={false}
        modifiers={[
          ...(onGeometry ? [onGeometry] : []),
          onScrollPhaseChange((phase) => {
            if (phase === 'interacting') {
              dragging.current = true;
              return;
            }
            if (dragging.current) {
              dragging.current = false;
              if (lastY.current < rest - DISMISS_PULL) onClose();
            }
          }),
        ]}>
        <VStack spacing={0} alignment="leading">
          {/* Grabber */}
          <HStack modifiers={[frame({ maxWidth: Infinity }), padding({ top: 6 })]}>
            <Capsule
              modifiers={[
                frame({ width: 36, height: 5 }),
                foregroundStyle('#D2D2D2'),
                onTapGesture(onClose),
                ...reveal(0, 0.1),
              ]}
            />
          </HStack>

          {/* Header — morphs from the card's title */}
          <VStack spacing={4} modifiers={[frame({ maxWidth: Infinity }), padding({ top: 14 }), ...reveal(-8, 0.02)]}>
            <Text modifiers={[font({ size: 20, weight: 'semibold' }), foregroundStyle(colors.text)]}>
              {collection.title}
            </Text>
            <Text modifiers={[font({ size: 14 }), foregroundStyle(colors.secondary)]}>{collection.subtitle}</Text>
          </VStack>

          <SearchRow
            placeholder="Search this collection"
            showFilter={false}
            modifiers={[padding({ top: 18, horizontal: 18 }), ...reveal(10, 0.06)]}
          />

          <Text
            modifiers={[
              font({ size: 14, weight: 'medium' }),
              foregroundStyle(colors.text),
              padding({ top: 24, bottom: 12, leading: 18 }),
              ...reveal(10, 0.08),
            ]}>
            Top books in collection shelf
          </Text>

          <Shelf
            books={collection.shelf}
            contentIn={contentIn}
            heroHidden={heroHidden}
            onHeroGeometry={onHeroGeometry}
            onFrame={onShelfFrame}
          />

          <Text
            modifiers={[
              font({ size: 14, weight: 'medium' }),
              foregroundStyle(colors.text),
              padding({ top: 30, bottom: 16, leading: 18 }),
              ...reveal(24, 0.14),
            ]}>
            Showing all
          </Text>

          <VStack spacing={26} modifiers={[padding({ horizontal: GRID_GUTTER }), ...reveal(60, 0.18)]}>
            {rows.map((row, r) => (
              <HStack key={r} spacing={GRID_GAP}>
                {row.map((bookId, c) => (
                  <Cover
                    key={bookId}
                    bookId={bookId}
                    width={gridCover}
                    height={coverHeight(gridCover)}
                    radius={9}
                    border={3}
                    rotation={c === 0 ? -2 : 2}
                    elevation="high"
                  />
                ))}
                {row.length === 1 && <Spacer />}
              </HStack>
            ))}
          </VStack>

          <Rectangle modifiers={[frame({ height: 60 }), opacity(0)]} />
        </VStack>
      </ScrollView>
    </ZStack>
  );
}
