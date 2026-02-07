import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors, Spacing } from '@/constants';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, style, ...props }: CardProps) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.grey50,
    borderWidth: 1,
    borderColor: Colors.grey200,
    borderRadius: 12,
    padding: Spacing.md,
  },
});
