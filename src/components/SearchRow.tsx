import { HStack, Image, TextField } from '@expo/ui/swift-ui';
import {
  background,
  font,
  foregroundStyle,
  frame,
  type ModifierConfig,
  padding,
  shadow,
  shapes,
  textFieldStyle,
} from '@expo/ui/swift-ui/modifiers';

import { colors, layout } from '@/theme';

type Props = {
  placeholder: string;
  showFilter?: boolean;
  onChangeText?: (text: string) => void;
  modifiers?: ModifierConfig[];
};

/** White pill search field + optional round filter button, as in every screen of the reference. */
export function SearchRow({ placeholder, showFilter = true, onChangeText, modifiers = [] }: Props) {
  return (
    <HStack spacing={8} modifiers={modifiers}>
      <HStack
        spacing={9}
        modifiers={[
          padding({ horizontal: 15 }),
          frame({ maxWidth: Infinity, minHeight: layout.fieldHeight, maxHeight: layout.fieldHeight }),
          background(colors.field, shapes.capsule()),
          shadow({ radius: 6, y: 2, color: '#0000000A' }),
        ]}>
        <Image systemName="magnifyingglass" size={16} color={colors.placeholder} />
        <TextField
          placeholder={placeholder}
          onTextChange={onChangeText}
          modifiers={[textFieldStyle('plain'), font({ size: 13 }), foregroundStyle(colors.text)]}
        />
      </HStack>
      {showFilter && (
        <Image
          systemName="slider.horizontal.3"
          size={17}
          color={colors.text}
          modifiers={[
            frame({ width: layout.fieldHeight, height: layout.fieldHeight }),
            background(colors.field, shapes.circle()),
            shadow({ radius: 6, y: 2, color: '#0000000A' }),
          ]}
        />
      )}
    </HStack>
  );
}
