import { Tabs } from 'expo-router';
import { LayoutDashboard, Briefcase, Users, Building, Settings } from 'lucide-react-native';

export default function EmployerLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'My Jobs',
          tabBarIcon: ({ color }) => <Briefcase size={24} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="applicants"
        options={{
          title: 'Applicants',
          tabBarIcon: ({ color }) => <Users size={24} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="company"
        options={{
          title: 'Company',
          tabBarIcon: ({ color }) => <Building size={24} stroke={color} />,
        }}
      />
    </Tabs>
  );
}
