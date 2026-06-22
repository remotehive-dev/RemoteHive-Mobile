import { Tabs } from 'expo-router';
import { LayoutDashboard, Briefcase, Clock, FileText, User } from 'lucide-react-native';
import { colors } from '../../src/theme';

export default function JobseekerLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
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
          title: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'All Jobs',
          tabBarIcon: ({ color, size }) => <Briefcase size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Clock size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="resume"
        options={{
          title: 'Resume',
          tabBarIcon: ({ color, size }) => <FileText size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} stroke={color} />,
        }}
      />
    </Tabs>
  );
}
