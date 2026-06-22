import { Tabs } from 'expo-router';
import { LayoutDashboard, Briefcase, Users, Building } from 'lucide-react-native';
import { colors } from '../../src/theme';

export default function EmployerLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.secondary,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarStyle: {
        backgroundColor: colors.white,
        borderTopColor: colors.border,
        paddingBottom: 4,
        height: 56,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'My Jobs',
          tabBarIcon: ({ color, size }) => <Briefcase size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="applicants"
        options={{
          title: 'Applicants',
          tabBarIcon: ({ color, size }) => <Users size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="company"
        options={{
          title: 'Company',
          tabBarIcon: ({ color, size }) => <Building size={size} stroke={color} />,
        }}
      />
    </Tabs>
  );
}
