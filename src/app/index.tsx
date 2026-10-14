import { Host, HStack, Image, Rectangle, ScrollView, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  animation,
  clipShape,
  font,
  foregroundStyle,
  frame,
  offset,
  opacity,
  padding,
  resizable,
} from '@expo/ui/swift-ui/modifiers';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { Cover, coverHeight } from '@/components/Cover';
import { SearchRow } from '@/components/SearchRow';
import { TOP_SELECTIONS } from '@/data/books';
import { imageUri } from '@/lib/covers';
import { colors, motion } from '@/theme';

const GUTTER = 24;
const GAP = 28;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const cover = Math.floor((width - GUTTER * 2 - GAP) / 2);
  const [appeared, setAppeared] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => setAppeared(true), 120);
      return () => {
        clearTimeout(t);
        setAppeared(false);
      };
    }, [])
  );

  const rows: string[][] = [];
  for (let i = 0; i < TOP_SELECTIONS.length; i += 2) rows.push(TOP_SELECTIONS.slice(i, i + 2));

  return (
    <Host style={styles.host}>
      <ScrollView showsIndicators={false}>
        <VStack spacing={0} alignment="leading">
          <HStack alignment="top" modifiers={[padding({ top: 16, horizontal: 18 })]}>
            <Text modifiers={[font({ size: 20, weight: 'semibold' }), foregroundStyle(colors.text)]}>
              {"Hi Audrey, let's sharpen your\nmind with great books."}
            </Text>
            <Spacer />
            <Image uiImage={imageUri('avatar')} modifiers={[resizable(), frame({ width: 38, height: 38 }), clipShape('circle')]} />
          </HStack>

          <SearchRow placeholder="Search books" modifiers={[padding({ top: 16, horizontal: 18 })]} />

          <Text
            modifiers={[
              font({ size: 14, weight: 'medium' }),
              foregroundStyle(colors.text),
              padding({ top: 22, bottom: 18, leading: 18 }),
            ]}>
            Top selections for you
          </Text>

          <VStack spacing={26} modifiers={[padding({ horizontal: GUTTER })]}>
            {rows.map((row, r) => (
              <HStack
                key={r}
                spacing={GAP}
                modifiers={[
                  opacity(appeared ? 1 : 0),
                  offset({ y: appeared ? 0 : 30 }),
                  animation(motion.stagger(r), appeared),
                ]}>
                {row.map((bookId, c) => (
                  <Cover
                    key={bookId}
                    bookId={bookId}
                    width={cover}
                    height={coverHeight(cover)}
                    radius={9}
                    border={3}
                    rotation={c === 0 ? -2 : 2}
                    elevation="high"
                  />
                ))}
              </HStack>
            ))}
          </VStack>

          <Rectangle modifiers={[frame({ height: 120 }), opacity(0)]} />
        </VStack>
      </ScrollView>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, backgroundColor: colors.background },
});
