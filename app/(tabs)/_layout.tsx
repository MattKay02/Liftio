import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.grey900,
        tabBarInactiveTintColor: Colors.grey400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon label="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabIcon label="📋" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon label="⚙️" color={color} />,
        }}
      />
    </Tabs>
  );
}

const TabIcon = ({ label }: { label: string; color: string }) => {
  return <Text style={styles.icon}>{label}</Text>;
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.grey200,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  icon: {
    fontSize: 20,
  },
});
