import { ContentUnavailableView, Host } from '@expo/ui/swift-ui';
import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

export default function LibraryScreen() {
  return (
    <Host style={styles.host}>
      <ContentUnavailableView title="Your library" systemImage="book.closed" description="Books you are reading will show up here." />
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, backgroundColor: colors.background },
});
