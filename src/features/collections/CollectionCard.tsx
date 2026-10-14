import { Button, HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  animation,
  background,
  buttonStyle,
  clipShape,
  contentShape,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  offset,
  onGeometryChange,
  opacity,
  padding,
  shapes,
} from '@expo/ui/swift-ui/modifiers';

import { Cover, coverHeight } from '@/components/Cover';
import type { Collection } from '@/data/books';
import { colors, layout, motion } from '@/theme';

import type { CoverPose, Rect } from './HeroLayer';

export const CARD_HEIGHT = 212;

/** The three fanned covers: measured widths, tilt and overlap from the reference. */
export const FAN = [
  { width: 84, rotation: -3, y: 2 },
  { width: 88, rotation: -2, y: 0 },
  { width: 110, rotation: 2.5, y: 1 },
];
const FAN_OVERLAP = -6;
const FAN_TOP = 14;
export const FAN_BORDER = 2.5;
export const FAN_RADIUS = 7;

/** Where each fanned cover sits on screen, given the fan row's global frame. */
export function fanPoses(row: Rect): CoverPose[] {
  let x = row.x;
  return FAN.map((f) => {
    const pose = {
      x,
      y: row.y + f.y,
      width: f.width,
      height: coverHeight(f.width),
      rotation: f.rotation,
      border: FAN_BORDER,
      radius: FAN_RADIUS,
    };
    x += f.width + FAN_OVERLAP;
    return pose;
  });
}

type Props = {
  collection: Collection;
  index: number;
  /** The fan is currently represented by the hero layer (in flight or on the shelf). */
  fanHidden: boolean;
  appeared: boolean;
  onPress: () => void;
  onFanGeometry: (id: string, rect: Rect) => void;
};

export function CollectionCard({ collection, index, fanHidden, appeared, onPress, onFanGeometry }: Props) {
  return (
    <Button
      onPress={onPress}
      modifiers={[
        buttonStyle('plain'),
        // Staggered entrance when the tab comes into focus.
        opacity(appeared ? 1 : 0),
        offset({ y: appeared ? 0 : 26 }),
        animation(motion.stagger(index), appeared),
      ]}>
      <VStack
        spacing={0}
        modifiers={[
          frame({ maxWidth: Infinity, minHeight: CARD_HEIGHT, maxHeight: CARD_HEIGHT, alignment: 'top' }),
          background(
            colors.card,
            shapes.roundedRectangle({ cornerRadius: layout.cardRadius, roundedCornerStyle: 'continuous' }),
          ),
          clipShape('roundedRectangle', layout.cardRadius),
          contentShape(shapes.roundedRectangle({ cornerRadius: layout.cardRadius })),
        ]}>
        <HStack spacing={5} modifiers={[padding({ top: 16, horizontal: 16 })]}>
          <Image systemName="timer" size={12} color={colors.text} />
          <Text modifiers={[font({ size: 11, weight: 'medium' }), foregroundStyle(colors.text)]}>
            {collection.updated}
          </Text>
          <Spacer />
          <Image systemName="book.closed" size={12} color={colors.text} />
          <Text modifiers={[font({ size: 11, weight: 'medium' }), foregroundStyle(colors.text)]}>
            {String(collection.count)}
          </Text>
        </HStack>

        <VStack spacing={3} modifiers={[padding({ top: 2 })]}>
          <Text modifiers={[font({ size: 15, weight: 'semibold' }), foregroundStyle(colors.text)]}>
            {collection.title}
          </Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(colors.secondary), lineLimit(1)]}>
            {collection.subtitle}
          </Text>
        </VStack>

        <HStack
          spacing={FAN_OVERLAP}
          alignment="top"
          modifiers={[
            padding({ top: FAN_TOP }),
            onGeometryChange((r) =>
              onFanGeometry(collection.id, { ...r, y: r.y + FAN_TOP, height: r.height - FAN_TOP }),
            ),
          ]}>
          {collection.shelf.slice(0, 3).map((bookId, i) => {
            const f = FAN[i];
            return (
              <Cover
                key={bookId}
                bookId={bookId}
                width={f.width}
                height={coverHeight(f.width)}
                rotation={f.rotation}
                border={FAN_BORDER}
                radius={FAN_RADIUS}
                z={i}
                modifiers={[offset({ y: f.y }), opacity(fanHidden ? 0 : 1)]}
              />
            );
          })}
        </HStack>
      </VStack>
    </Button>
  );
}
