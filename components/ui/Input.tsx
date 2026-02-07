import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'number';
}

export const Input = ({ variant = 'default', style, ...props }: InputProps) => {
  return (
    <TextInput
      style={[styles.input, variant === 'number' && styles.numberInput, style]}
      placeholderTextColor={Colors.grey400}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.grey100,
    borderWidth: 1,
    borderColor: Colors.grey300,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.body,
    color: Colors.grey900,
    minHeight: 44,
  },
  numberInput: {
    textAlign: 'center',
  },
});
