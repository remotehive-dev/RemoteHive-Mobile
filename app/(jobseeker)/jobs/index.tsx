import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '../../../src/lib/api';

export default function JobsList() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.jobs({ limit: 20 }).then(setJobs).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 100 }} />;

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/(jobseeker)/jobs/[id]', params: { id: item.id } })}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.company}>{item.company_name}</Text>
          <Text style={styles.meta}>{item.location} · {item.type}</Text>
          {item.salary_range ? <Text style={styles.salary}>{item.salary_range}</Text> : null}
        </TouchableOpacity>
      )}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text style={styles.empty}>No jobs found</Text>}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  company: { fontSize: 14, color: '#007AFF', marginTop: 2 },
  meta: { fontSize: 13, color: '#666', marginTop: 6 },
  salary: { fontSize: 14, fontWeight: '500', color: '#34C759', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});
