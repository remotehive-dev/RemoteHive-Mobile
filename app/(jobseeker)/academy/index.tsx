import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '../../../src/lib/api';

export default function Academy() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.roles().then(setRoles).catch(() => setRoles([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 100 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Academy</Text>
        <Text style={styles.subtitle}>Learn skills and ace interviews</Text>
      </View>
      <FlatList
        data={roles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.roleName}>{item.name}</Text>
            <Text style={styles.roleCategory}>{item.category}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Courses coming soon</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#6c757d', marginTop: 5 },
  card: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  roleName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  roleCategory: { fontSize: 13, color: '#666', marginTop: 4, textTransform: 'capitalize' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
