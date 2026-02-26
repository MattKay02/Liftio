import { View, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings } from 'lucide-react-native';
import { Colors } from '@/constants';

interface HeaderProps {
  showSettings?: boolean;
  onSettingsPress?: () => void;
}

export const Header = ({ showSettings = false, onSettingsPress }: HeaderProps) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/images/logo/liftio-high-resolution-logo-transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Settings Button */}
        {showSettings && (
          <Pressable style={styles.settingsButton} onPress={onSettingsPress}>
            <Settings size={24} color={Colors.textPrimary} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.bg,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  settingsButton: {
    padding: 8,
  },
});
