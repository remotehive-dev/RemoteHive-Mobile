import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase, User } from 'lucide-react-native';

export default function RoleSelect() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>Select how you want to use RemoteHive today</Text>

      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => router.replace('/(jobseeker)')}
      >
        <User size={40} color="#007AFF" />
        <View style={styles.roleInfo}>
          <Text style={styles.roleTitle}>Jobseeker</Text>
          <Text style={styles.roleDesc}>Find and apply for remote opportunities</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => router.replace('/(employer)')}
      >
        <Briefcase size={40} color="#34C759" />
        <View style={styles.roleInfo}>
          <Text style={styles.roleTitle}>Employer</Text>
          <Text style={styles.roleDesc}>Post jobs and find top remote talent</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  roleInfo: {
    marginLeft: 20,
    flex: 1,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  roleDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  }
});
