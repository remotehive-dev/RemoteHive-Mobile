import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/theme';

const COURSE_DETAILS: Record<string, { title: string; duration: string; lessons: number; difficulty: string; enrolled: number; topics: string[]; description: string }> = {
  'react-0': { title: 'React Fundamentals', duration: '4h', lessons: 12, difficulty: 'Beginner', enrolled: 2340, description: 'Learn the core concepts of React including JSX, components, props, state, and lifecycle methods.', topics: ['JSX Syntax', 'Functional Components', 'Props & State', 'Event Handling', 'Conditional Rendering', 'Lists & Keys', 'Forms & Controlled Components', 'Lifting State Up', 'Composition vs Inheritance', 'React DevTools', 'Thinking in React', 'Project: Todo App'] },
  'react-1': { title: 'React Hooks Deep Dive', duration: '3h', lessons: 8, difficulty: 'Intermediate', enrolled: 1890, description: 'Master React Hooks including useState, useEffect, useContext, useReducer, and custom hooks.', topics: ['useState Deep Dive', 'useEffect & Lifecycle', 'useContext & Context API', 'useReducer for Complex State', 'useCallback & useMemo', 'useRef & DOM Access', 'Custom Hooks', 'Project: Custom Hook Library'] },
};

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([]);

  const course = COURSE_DETAILS[id || ''] || {
    title: 'Course Details',
    duration: '3h',
    lessons: 10,
    difficulty: 'Intermediate',
    enrolled: 1500,
    description: 'Complete course content with video lessons and practice exercises.',
    topics: Array.from({ length: 10 }, (_, i) => `Lesson ${i + 1}: Topic ${i + 1}`),
  };

  const sendAiMessage = () => {
    if (!aiInput.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', text: aiInput }]);
    setTimeout(() => {
      setAiMessages(prev => [...prev, { role: 'ai', text: `Great question about "${aiInput}"! This is a key concept in ${course.title}. Let me explain with an example...` }]);
    }, 1000);
    setAiInput('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Course</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: course.difficulty === 'Beginner' ? colors.success + '20' : course.difficulty === 'Intermediate' ? colors.warning + '20' : colors.error + '20' }]}>
              <Text style={[styles.badgeText, { color: course.difficulty === 'Beginner' ? colors.success : course.difficulty === 'Intermediate' ? colors.warning : colors.error }]}>{course.difficulty}</Text>
            </View>
            <Text style={styles.meta}>⏱ {course.duration}</Text>
            <Text style={styles.meta}>📚 {course.lessons} lessons</Text>
          </View>
          <Text style={styles.enrolled}>👥 {course.enrolled.toLocaleString()} enrolled</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this course</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Content</Text>
          {course.topics.map((topic: string, i: number) => (
            <TouchableOpacity key={i} style={[styles.lessonCard, activeLesson === i && styles.lessonCardActive]} onPress={() => setActiveLesson(activeLesson === i ? null : i)}>
              <View style={styles.lessonHeader}>
                <View style={[styles.lessonNumber, activeLesson === i && styles.lessonNumberActive]}>
                  <Text style={[styles.lessonNumberText, activeLesson === i && { color: colors.white }]}>{i + 1}</Text>
                </View>
                <Text style={styles.lessonTitle}>{topic}</Text>
                <Text style={styles.lessonArrow}>{activeLesson === i ? '▼' : '▶'}</Text>
              </View>
              {activeLesson === i && (
                <View style={styles.lessonContent}>
                  <View style={styles.videoPlaceholder}>
                    <Text style={styles.videoPlaceholderText}>▶ Video lesson</Text>
                    <Text style={styles.videoDuration}>15:00</Text>
                  </View>
                  <Text style={styles.lessonDesc}>In this lesson, you will learn the key concepts and practical applications of {topic.toLowerCase()}. Follow along with the video and try the practice exercise.</Text>
                  <TouchableOpacity style={styles.practiceBtn}>
                    <Text style={styles.practiceBtnText}>Practice Exercise</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Tutor</Text>
          <View style={styles.aiContainer}>
            {aiMessages.length === 0 && (
              <Text style={styles.aiPlaceholder}>Ask anything about this course. Get instant AI-powered explanations!</Text>
            )}
            {aiMessages.map((msg, i) => (
              <View key={i} style={[styles.message, msg.role === 'user' ? styles.userMsg : styles.aiMsg]}>
                <Text style={[styles.messageText, msg.role === 'user' && { color: colors.white }]}>{msg.text}</Text>
              </View>
            ))}
            <View style={styles.aiInputRow}>
              <TextInput style={styles.aiInput} placeholder="Ask AI Tutor..." placeholderTextColor={colors.textTertiary} value={aiInput} onChangeText={setAiInput} />
              <TouchableOpacity style={styles.sendBtn} onPress={sendAiMessage}>
                <Text style={styles.sendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  hero: { padding: spacing.lg, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  courseTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { fontSize: 13, color: colors.textSecondary },
  enrolled: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  lessonCard: { backgroundColor: colors.card, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden' },
  lessonCardActive: { borderColor: colors.primary },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  lessonNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.inputBg, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  lessonNumberActive: { backgroundColor: colors.primary },
  lessonNumberText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  lessonTitle: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text },
  lessonArrow: { fontSize: 12, color: colors.textTertiary },
  lessonContent: { padding: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm },
  videoPlaceholder: { backgroundColor: '#1a1a2e', borderRadius: borderRadius.md, padding: spacing.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  videoPlaceholderText: { fontSize: 18, color: colors.white, fontWeight: '600' },
  videoDuration: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  lessonDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  practiceBtn: { marginTop: spacing.sm, backgroundColor: colors.primaryLight + '30', paddingVertical: 8, borderRadius: borderRadius.md, alignItems: 'center' },
  practiceBtnText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  aiContainer: { backgroundColor: colors.card, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  aiPlaceholder: { fontSize: 13, color: colors.textTertiary, textAlign: 'center', padding: spacing.md },
  message: { padding: spacing.sm, borderRadius: borderRadius.sm, marginBottom: spacing.xs, maxWidth: '85%' },
  userMsg: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  aiMsg: { backgroundColor: colors.inputBg, alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  messageText: { fontSize: 13, color: colors.text, lineHeight: 18 },
  aiInputRow: { flexDirection: 'row', marginTop: spacing.sm, gap: spacing.xs },
  aiInput: { flex: 1, backgroundColor: colors.inputBg, borderRadius: borderRadius.md, padding: spacing.sm, fontSize: 13, color: colors.text, borderWidth: 1, borderColor: colors.border },
  sendBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, justifyContent: 'center' },
  sendBtnText: { color: colors.white, fontWeight: '600', fontSize: 13 },
});
