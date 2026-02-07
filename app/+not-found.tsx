import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey900,
  },
  link: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
  },
  linkText: {
    fontSize: Typography.fontSize.body,
    color: Colors.grey600,
  },
});
