import { Circle, GlassEffectContainer, Host, HStack, Image, Namespace, ZStack } from '@expo/ui/swift-ui';
import {
  animation,
  background,
  contentShape,
  frame,
  foregroundStyle,
  matchedGeometryEffect,
  offset,
  opacity,
  onTapGesture,
  padding,
  shapes,
  strokeBorder,
} from '@expo/ui/swift-ui/modifiers';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarHidden } from '@/lib/ui-store';
import { colors, motion } from '@/theme';

const ICONS: Record<string, string> = {
  index: 'circle.grid.2x2',
  collections: 'bookmark.square',
  library: 'book.closed',
  settings: 'gearshape',
};

const BAR_HEIGHT = 56;
const ITEM = 52;

/**
 * The dark floating capsule from the reference. The light selection disc is a
 * single matched-geometry view, so it glides between icons instead of
 * cross-fading.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const ns = useId();
  const hidden = useTabBarHidden();
  const insets = useSafeAreaInsets();

  return (
    // A real-sized absolute container: touches outside a parent's bounds are never delivered.
    <View
      pointerEvents={hidden ? 'none' : 'box-none'}
      style={[styles.container, { height: BAR_HEIGHT + Math.max(insets.bottom - 22, 10) }]}>
      <Host matchContents style={styles.host}>
        <Namespace id={ns}>
          <GlassEffectContainer
            modifiers={[offset({ y: hidden ? 140 : 0 }), opacity(hidden ? 0 : 1), animation(motion.hero, hidden)]}>
            <HStack
              spacing={0}
              modifiers={[
                padding({ horizontal: 6 }),
                frame({ height: BAR_HEIGHT }),
                background(colors.tabBar, shapes.capsule()),
                animation(motion.tab, state.index),
              ]}>
              {state.routes.map((route, i) => {
                const focused = state.index === i;
                return (
                  <ZStack
                    key={route.key}
                    modifiers={[
                      frame({ width: ITEM, height: ITEM }),
                      contentShape(shapes.circle()),
                      onTapGesture(() => {
                        if (focused) return;
                        Haptics.selectionAsync();
                        const event = navigation.emit({
                          type: 'tabPress',
                          target: route.key,
                          canPreventDefault: true,
                        });
                        if (!event.defaultPrevented) navigation.navigate(route.name);
                      }),
                    ]}>
                    {focused && (
                    <Circle
                      modifiers={[
                        foregroundStyle('#FFFFFF2E'),
                        strokeBorder({ content: '#FFFFFF6B', style: { lineWidth: 1.2 }, shape: 'circle' }),
                        frame({ width: ITEM, height: ITEM }),
                        matchedGeometryEffect('tab-selection', ns),
                      ]}
                    />
                  )}
                    <Image
                      systemName={ICONS[route.name] as any}
                      size={20}
                      color={focused ? colors.tabIconActive : colors.tabIcon}
                    />
                  </ZStack>
                );
              })}
            </HStack>
          </GlassEffectContainer>
        </Namespace>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  host: { height: BAR_HEIGHT },
});
