import { Host, Rectangle, ScrollView, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  animation,
  blur,
  font,
  foregroundStyle,
  frame,
  onGeometryChange,
  opacity,
  padding,
  zIndex,
} from '@expo/ui/swift-ui/modifiers';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { SearchRow } from '@/components/SearchRow';
import { COLLECTIONS } from '@/data/books';
import { CollectionCard, fanPoses } from '@/features/collections/CollectionCard';
import { CollectionDetail } from '@/features/collections/CollectionDetail';
import { HeroLayer, type CoverPose, type Flight, type Rect } from '@/features/collections/HeroLayer';
import { SHELF_COVER, SHELF_GAP } from '@/features/collections/Shelf';
import { coverHeight } from '@/components/Cover';
import { setTabBarHidden } from '@/lib/ui-store';
import { colors, motion } from '@/theme';

/**
 * closed → lift (hero covers mounted on the card) → fly (spring to the shelf) → open
 * open → land (hero covers mounted on the shelf) → return (spring to the card) → closed
 */
type Phase = 'closed' | 'lift' | 'fly' | 'open' | 'land' | 'return';

const FLY_MS = 560;
const RETURN_MS = 520;

const shelfPose = (r: Rect): CoverPose => ({
  x: r.x,
  y: r.y,
  width: SHELF_COVER,
  height: coverHeight(SHELF_COVER),
  rotation: 0,
  border: 0,
  radius: 1.5,
});

export default function CollectionsScreen() {
  'use no memo';
  const [phase, setPhase] = useState<Phase>('closed');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openCount, setOpenCount] = useState(0);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [appeared, setAppeared] = useState(false);

  // Live geometry, kept in refs: it changes every scroll frame and must not re-render.
  const fans = useRef<Record<string, Rect>>({});
  const shelf = useRef<Record<number, Rect>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onHeroReady = useRef<(() => void) | null>(null);
  const pendingOpen = useRef<string | null>(null);
  const shelfFrame = useRef<Rect | null>(null);
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => setAppeared(true), 120);
      return () => {
        clearTimeout(t);
        setAppeared(false);
      };
    }, []),
  );

  /**
   * Opening lands on the shelf's resting layout (first book snapped to the leading edge);
   * closing leaves from wherever the shelf books are right now (scrolled, or mid pull-down).
   */
  const buildFlight = (id: string, toShelf: boolean): Flight | null => {
    const collection = COLLECTIONS.find((c) => c.id === id)!;
    const fan = fans.current[id];
    const frame = shelfFrame.current;
    if (!fan || !frame) return null;
    const from = fanPoses(fan);
    return collection.shelf.slice(0, 3).map((bookId, i) => {
      const resting = { x: frame.x + i * (SHELF_COVER + SHELF_GAP), y: frame.y, width: 0, height: 0 };
      const live = toShelf ? undefined : shelf.current[i];
      return { bookId, from: from[i], to: shelfPose(live ?? resting) };
    });
  };

  const launch = () => {
    const id = pendingOpen.current;
    if (!id) return;
    const f = buildFlight(id, true);
    if (!f) return;
    pendingOpen.current = null;
    onHeroReady.current = () => {
      setPhase('fly');
      later(FLY_MS, () => land('open'));
    };
    setFlight(f);
  };

  const open = (id: string) => {
    if (phase !== 'closed') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    shelf.current = {};
    shelfFrame.current = null;
    setSelectedId(id);
    setOpenCount((n) => n + 1); // fresh detail: scrolled to top, shelf on its first book
    setTabBarHidden(true);
    setPhase('lift');
    // The freshly mounted (invisible) detail reports its shelf frame, which triggers `launch`.
    pendingOpen.current = id;
    later(900, () => {
      // Geometry never arrived: skip the flight rather than hang.
      if (pendingOpen.current === id) {
        pendingOpen.current = null;
        land('open');
      }
    });
  };

  /** Finish a flight: the real covers take over and the hero layer goes away. */
  const land = (next: 'open' | 'closed') => {
    onHeroReady.current = null;
    setPhase(next);
    setFlight(null);
  };

  const close = () => {
    if (phase !== 'open' || !selectedId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    const f = buildFlight(selectedId, false);
    if (!f) {
      setTabBarHidden(false);
      return land('closed');
    }
    // Mount the hero covers where the shelf books are right now (possibly mid pull-down),
    // then spring them home to the card once they're on screen.
    onHeroReady.current = () => {
      setPhase('return');
      setTabBarHidden(false);
      later(RETURN_MS, () => land('closed'));
    };
    setFlight(f);
    setPhase('land');
  };

  const detailShown = phase === 'fly' || phase === 'open' || phase === 'land';
  const listDimmed = phase !== 'closed' && phase !== 'return';
  const heroAtShelf = phase === 'fly' || phase === 'land';
  const selected = COLLECTIONS.find((c) => c.id === selectedId);

  return (
    <Host style={styles.host}>
      <ZStack
        alignment="top"
        modifiers={[onGeometryChange((r) => setOrigin((o) => (o.x === r.x && o.y === r.y ? o : { x: r.x, y: r.y })))]}>
        {/* List */}
        <ScrollView
          showsIndicators={false}
          modifiers={[
            blur(listDimmed ? 10 : 0),
            opacity(listDimmed ? 0 : 1),
            animation(listDimmed ? motion.hero : motion.heroClose, listDimmed),
          ]}>
          <VStack spacing={0} alignment="leading" modifiers={[padding({ horizontal: 18 })]}>
            <Text
              modifiers={[
                font({ size: 20, weight: 'semibold' }),
                foregroundStyle(colors.text),
                frame({ maxWidth: Infinity }),
                padding({ top: 16 }),
              ]}>
              Collections
            </Text>
            <SearchRow placeholder="Search collections" modifiers={[padding({ top: 18 })]} />
            <Text
              modifiers={[
                font({ size: 14, weight: 'medium' }),
                foregroundStyle(colors.text),
                padding({ top: 16, bottom: 10 }),
              ]}>
              Showing all
            </Text>
            <VStack spacing={18}>
              {COLLECTIONS.map((c, i) => (
                <CollectionCard
                  key={c.id}
                  collection={c}
                  index={i}
                  fanHidden={c.id === selectedId && phase !== 'closed'}
                  appeared={appeared}
                  onPress={() => open(c.id)}
                  onFanGeometry={(id, r) => (fans.current[id] = r)}
                />
              ))}
            </VStack>
            <Rectangle modifiers={[frame({ height: 120 }), opacity(0)]} />
          </VStack>
        </ScrollView>

        {/* Detail sheet: mounted invisibly at "lift" so its shelf can be measured before take-off,
            unmounted once the covers are home. */}
        {selected && phase !== 'closed' && (
          <ZStack
            key={`${selected.id}-${openCount}`}
            modifiers={[
              opacity(detailShown ? 1 : 0),
              animation(detailShown ? motion.fadeIn : motion.heroClose, detailShown),
              zIndex(1),
            ]}>
            <CollectionDetail
              collection={selected}
              contentIn={phase === 'fly' || phase === 'open'}
              heroHidden={phase !== 'open'}
              onHeroGeometry={(i, r) => (shelf.current[i] = r)}
              onShelfFrame={(r) => {
                shelfFrame.current = r;
                launch();
              }}
              onClose={close}
            />
          </ZStack>
        )}

        <HeroLayer
          flight={flight}
          atTarget={heroAtShelf}
          origin={origin}
          onReady={() => requestAnimationFrame(() => onHeroReady.current?.())}
        />
      </ZStack>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, backgroundColor: colors.background },
});
