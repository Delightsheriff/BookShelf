import { Form, Host, Section, Toggle } from '@expo/ui/swift-ui';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

export default function SettingsScreen() {
  const [haptics, setHaptics] = useState(true);
  const [reminders, setReminders] = useState(false);
  return (
    <Host style={styles.host}>
      <Form>
        <Section title="Reading">
          <Toggle label="Haptic feedback" isOn={haptics} onIsOnChange={setHaptics} />
          <Toggle label="Daily reading reminder" isOn={reminders} onIsOnChange={setReminders} />
        </Section>
      </Form>
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, backgroundColor: colors.background },
});
