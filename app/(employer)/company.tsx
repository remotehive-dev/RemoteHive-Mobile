import { View, Text, StyleSheet } from 'react-native';

export default function Company() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Company</Text>
      <Text style={styles.empty}>Company profile coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  empty: { fontSize: 15, color: '#666', textAlign: 'center' },
});
