import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const Checkbox = ({ checked, onPress, disabled = false }: CheckboxProps) => {
  return (
    <Pressable
      style={[styles.checkbox, checked && styles.checked]}
      onPress={onPress}
      disabled={disabled}
    >
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.grey300,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: Colors.grey500,
    borderColor: Colors.grey500,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
