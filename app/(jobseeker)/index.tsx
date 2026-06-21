import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTrendingJobs } from '../../src/hooks/useJobs';
import { JobCard } from '../../src/components/JobCard';
import { useRouter } from 'expo-router';

export default function JobseekerHome() {
  const { data: jobs, isLoading } = useTrendingJobs(5);
  const router = useRouter();

  const handleJobPress = (job: any) => {
    router.push({
      pathname: '/(jobseeker)/jobs/[id]',
      params: { id: job.id }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RemoteHive</Text>
        <Text style={styles.subtitle}>Find your dream remote job</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Jobs</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          jobs?.map(job => (
            <JobCard key={job.id} job={job} onPress={handleJobPress} />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <View style={styles.categoryRow}>
          <View style={styles.categoryCard}><Text style={styles.categoryText}>Development</Text></View>
          <View style={styles.categoryCard}><Text style={styles.categoryText}>Design</Text></View>
        </View>
        <View style={styles.categoryRow}>
          <View style={styles.categoryCard}><Text style={styles.categoryText}>Marketing</Text></View>
          <View style={styles.categoryCard}><Text style={styles.categoryText}>Product</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryCard: {
    flex: 0.48,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontWeight: '500',
    color: '#333',
  }
});
