import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';

interface EmptyStateProps {
  title: string;
  message: string;
}

export const EmptyState = ({ title, message }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.bodyLg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.grey600,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.fontSize.body,
    color: Colors.grey400,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.body,
  },
});
