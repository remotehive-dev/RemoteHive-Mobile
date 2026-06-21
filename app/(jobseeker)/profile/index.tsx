import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>
      <TouchableOpacity style={styles.signOut} onPress={() => { signOut(); router.replace('/(auth)/login'); }}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#6c757d', marginTop: 5 },
  signOut: { margin: 20, padding: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ff4444', alignItems: 'center' },
  signOutText: { color: '#ff4444', fontSize: 16, fontWeight: '500' },
});
