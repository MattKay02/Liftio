import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants';

interface DividerProps {
  marginVertical?: number;
}

export const Divider = ({ marginVertical = Spacing.md }: DividerProps) => {
  return <View style={[styles.divider, { marginVertical }]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.grey200,
  },
});
