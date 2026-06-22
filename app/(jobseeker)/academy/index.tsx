import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/theme';

const ROLES = [
  { id: 'react', name: 'React Developer', icon: '⚛️', count: 24, color: '#61DAFB' },
  { id: 'python', name: 'Python Developer', icon: '🐍', count: 18, color: '#3776AB' },
  { id: 'java', name: 'Java Developer', icon: '☕', count: 15, color: '#ED8B00' },
  { id: 'devops', name: 'DevOps Engineer', icon: '🐳', count: 12, color: '#2496ED' },
  { id: 'data', name: 'Data Scientist', icon: '📊', count: 10, color: '#FF6F00' },
  { id: 'mobile', name: 'Mobile Developer', icon: '📱', count: 9, color: '#34A853' },
  { id: 'uiux', name: 'UI/UX Designer', icon: '🎨', count: 8, color: '#FF4081' },
  { id: 'fullstack', name: 'Full Stack', icon: '🌐', count: 20, color: '#6C63FF' },
];

const COURSES: Record<string, { title: string; duration: string; lessons: number; difficulty: string; enrolled: number }[]> = {
  react: [
    { title: 'React Fundamentals', duration: '4h', lessons: 12, difficulty: 'Beginner', enrolled: 2340 },
    { title: 'React Hooks Deep Dive', duration: '3h', lessons: 8, difficulty: 'Intermediate', enrolled: 1890 },
    { title: 'React Performance Optimization', duration: '2.5h', lessons: 6, difficulty: 'Advanced', enrolled: 980 },
    { title: 'React Native Mobile Apps', duration: '5h', lessons: 15, difficulty: 'Intermediate', enrolled: 1560 },
    { title: 'State Management with Redux', duration: '3.5h', lessons: 10, difficulty: 'Intermediate', enrolled: 2100 },
    { title: 'Next.js Full-Stack', duration: '4.5h', lessons: 14, difficulty: 'Advanced', enrolled: 1750 },
    { title: 'Testing React Apps', duration: '2h', lessons: 6, difficulty: 'Intermediate', enrolled: 890 },
    { title: 'React Patterns & Best Practices', duration: '3h', lessons: 9, difficulty: 'Intermediate', enrolled: 1230 },
    { title: 'TypeScript with React', duration: '3.5h', lessons: 11, difficulty: 'Advanced', enrolled: 1670 },
    { title: 'Building Design Systems', duration: '4h', lessons: 12, difficulty: 'Advanced', enrolled: 720 },
  ],
  python: [
    { title: 'Python for Beginners', duration: '5h', lessons: 16, difficulty: 'Beginner', enrolled: 4500 },
    { title: 'Django Web Framework', duration: '6h', lessons: 18, difficulty: 'Intermediate', enrolled: 3200 },
    { title: 'FastAPI REST APIs', duration: '3h', lessons: 10, difficulty: 'Intermediate', enrolled: 2100 },
    { title: 'Python for Data Analysis', duration: '4h', lessons: 12, difficulty: 'Intermediate', enrolled: 3800 },
    { title: 'Machine Learning with Python', duration: '8h', lessons: 20, difficulty: 'Advanced', enrolled: 5600 },
    { title: 'Web Scraping with Python', duration: '2.5h', lessons: 8, difficulty: 'Intermediate', enrolled: 1450 },
    { title: 'Python Automation Scripts', duration: '2h', lessons: 7, difficulty: 'Beginner', enrolled: 2300 },
    { title: 'Flask for Microservices', duration: '3h', lessons: 9, difficulty: 'Advanced', enrolled: 1100 },
    { title: 'Async Python & Asyncio', duration: '3.5h', lessons: 10, difficulty: 'Advanced', enrolled: 890 },
    { title: 'Python Testing (pytest)', duration: '2h', lessons: 6, difficulty: 'Intermediate', enrolled: 1560 },
  ],
  java: [
    { title: 'Java Fundamentals', duration: '6h', lessons: 18, difficulty: 'Beginner', enrolled: 3200 },
    { title: 'Spring Boot REST API', duration: '5h', lessons: 15, difficulty: 'Intermediate', enrolled: 2800 },
  ],
  devops: [
    { title: 'Docker & Containers', duration: '4h', lessons: 12, difficulty: 'Beginner', enrolled: 2900 },
    { title: 'Kubernetes Orchestration', duration: '5h', lessons: 14, difficulty: 'Advanced', enrolled: 2100 },
  ],
  data: [
    { title: 'SQL for Data Analysis', duration: '3h', lessons: 10, difficulty: 'Beginner', enrolled: 4100 },
    { title: 'Data Visualization', duration: '2.5h', lessons: 8, difficulty: 'Beginner', enrolled: 2300 },
  ],
  mobile: [
    { title: 'React Native Basics', duration: '4h', lessons: 12, difficulty: 'Beginner', enrolled: 1800 },
    { title: 'Flutter for Beginners', duration: '5h', lessons: 14, difficulty: 'Beginner', enrolled: 1500 },
  ],
  uiux: [
    { title: 'Figma for UI Design', duration: '3h', lessons: 10, difficulty: 'Beginner', enrolled: 3400 },
    { title: 'UX Research Methods', duration: '2.5h', lessons: 8, difficulty: 'Intermediate', enrolled: 1200 },
  ],
  fullstack: [
    { title: 'Full-Stack MERN', duration: '8h', lessons: 22, difficulty: 'Intermediate', enrolled: 4100 },
    { title: 'GraphQL API Design', duration: '3h', lessons: 10, difficulty: 'Advanced', enrolled: 1600 },
  ],
};

export default function Academy() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const courses = selectedRole ? (COURSES[selectedRole] || []) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Academy</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {!selectedRole ? (
          <>
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>Interview Preparation</Text>
              <Text style={styles.heroDesc}>Choose your role to access curated courses, mock interviews, and AI-powered practice</Text>
            </View>

            <View style={styles.rolesGrid}>
              {ROLES.map(role => (
                <TouchableOpacity key={role.id} style={styles.roleCard} onPress={() => setSelectedRole(role.id)}>
                  <View style={[styles.roleIcon, { backgroundColor: role.color + '20' }]}>
                    <Text style={styles.roleEmoji}>{role.icon}</Text>
                  </View>
                  <Text style={styles.roleName}>{role.name}</Text>
                  <Text style={styles.roleCount}>{role.count} courses</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={styles.roleHeader}>
              <TouchableOpacity onPress={() => setSelectedRole(null)}><Text style={styles.backLink}>← All Roles</Text></TouchableOpacity>
              <Text style={styles.selectedRoleTitle}>{ROLES.find(r => r.id === selectedRole)?.name} Courses</Text>
              <Text style={styles.courseCount}>{courses.length} courses available</Text>
            </View>

            {courses.map((course, i) => (
              <TouchableOpacity key={i} style={styles.courseCard} onPress={() => router.push(`/(jobseeker)/academy/${selectedRole}-${i}`)}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <View style={[styles.difficultyBadge, {
                    backgroundColor: course.difficulty === 'Beginner' ? colors.success + '20' : course.difficulty === 'Intermediate' ? colors.warning + '20' : colors.error + '20'
                  }]}>
                    <Text style={[styles.difficultyText, {
                      color: course.difficulty === 'Beginner' ? colors.success : course.difficulty === 'Intermediate' ? colors.warning : colors.error
                    }]}>{course.difficulty}</Text>
                  </View>
                </View>
                <View style={styles.courseMeta}>
                  <Text style={styles.courseMetaText}>⏱ {course.duration}</Text>
                  <Text style={styles.courseMetaText}>📚 {course.lessons} lessons</Text>
                  <Text style={styles.courseMetaText}>👥 {course.enrolled.toLocaleString()} enrolled</Text>
                </View>
                <TouchableOpacity style={styles.startBtn} onPress={() => router.push(`/(jobseeker)/academy/${selectedRole}-${i}`)}>
                  <Text style={styles.startBtnText}>Start Learning</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  content: { flex: 1 },
  hero: { padding: spacing.lg, backgroundColor: colors.primary },
  heroTitle: { fontSize: 20, fontWeight: '700', color: colors.white },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, lineHeight: 18 },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.sm, gap: spacing.sm },
  roleCard: { width: '47%', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  roleIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  roleEmoji: { fontSize: 24 },
  roleName: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: spacing.sm, textAlign: 'center' },
  roleCount: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  roleHeader: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  backLink: { fontSize: 14, color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },
  selectedRoleTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  courseCount: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  courseCard: { margin: spacing.lg, marginTop: spacing.sm, marginBottom: 0, backgroundColor: colors.card, padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  courseTitle: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: spacing.sm },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  difficultyText: { fontSize: 11, fontWeight: '700' },
  courseMeta: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.md },
  courseMetaText: { fontSize: 12, color: colors.textSecondary },
  startBtn: { marginTop: spacing.md, backgroundColor: colors.primary, paddingVertical: 10, borderRadius: borderRadius.md, alignItems: 'center' },
  startBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});
