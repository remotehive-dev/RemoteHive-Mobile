import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';

const TEMPLATES = [
  { id: 'modern', name: 'Modern', color: '#2563EB' },
  { id: 'classic', name: 'Classic', color: '#1E293B' },
  { id: 'minimal', name: 'Minimal', color: '#64748B' },
  { id: 'creative', name: 'Creative', color: '#7C3AED' },
  { id: 'executive', name: 'Executive', color: '#0F766E' },
  { id: 'technical', name: 'Technical', color: '#0369A1' },
];

type Section = { id: string; title: string; enabled: boolean; content: string };

export default function ResumeBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [sections, setSections] = useState<Section[]>([
    { id: 'profile', title: 'Professional Summary', enabled: true, content: '' },
    { id: 'experience', title: 'Work Experience', enabled: true, content: '' },
    { id: 'education', title: 'Education', enabled: true, content: '' },
    { id: 'skills', title: 'Skills', enabled: true, content: '' },
    { id: 'projects', title: 'Projects', enabled: false, content: '' },
    { id: 'certifications', title: 'Certifications', enabled: false, content: '' },
  ]);

  const updateSection = (id: string, field: 'enabled' | 'content', value: any) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resume Builder</Text>
        <Text style={styles.subtitle}>Create a professional resume</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionLabel}>Choose Template</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
          {TEMPLATES.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.templateCard, selectedTemplate === t.id && { borderColor: t.color, borderWidth: 2 }]}
              onPress={() => setSelectedTemplate(t.id)}
            >
              <View style={[styles.templatePreview, { backgroundColor: t.color + '15' }]}>
                <View style={[styles.templateAccent, { backgroundColor: t.color }]} />
                <View style={styles.templateLines}>
                  {[60, 90, 50, 70, 40].map((w, i) => (
                    <View key={i} style={[styles.mockLine, { width: `${w}%`, backgroundColor: t.color + '40' }]} />
                  ))}
                </View>
              </View>
              <Text style={styles.templateName}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Resume Sections</Text>
        {sections.map(section => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <TouchableOpacity onPress={() => updateSection(section.id, 'enabled', !section.enabled)}>
                <View style={[styles.toggle, section.enabled && styles.toggleActive]}>
                  <View style={[styles.toggleDot, section.enabled && styles.toggleDotActive]} />
                </View>
              </TouchableOpacity>
            </View>
            {section.enabled && (
              <TextInput
                style={styles.sectionInput}
                placeholder={`Add your ${section.title.toLowerCase()} here...`}
                value={section.content}
                onChangeText={v => updateSection(section.id, 'content', v)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.previewBtn}>
          <Text style={styles.previewBtnText}>Preview Resume</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>Export as PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.aiBtn}>
          <Text style={styles.aiBtnText}>AI Rewrite Bullet Points</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md, backgroundColor: colors.primary },
  title: { fontSize: 22, fontWeight: '700', color: colors.white },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  content: { flex: 1, padding: spacing.lg },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  templateScroll: { marginBottom: spacing.sm },
  templateCard: { width: 130, marginRight: spacing.sm, backgroundColor: colors.card, borderRadius: borderRadius.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  templatePreview: { height: 90, borderRadius: borderRadius.sm, padding: spacing.xs, justifyContent: 'center' },
  templateAccent: { height: 4, borderRadius: 2, marginBottom: spacing.xs },
  templateLines: { gap: 3 },
  mockLine: { height: 4, borderRadius: 2 },
  templateName: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: spacing.xs },
  sectionCard: { backgroundColor: colors.card, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  toggle: { width: 40, height: 22, borderRadius: 11, backgroundColor: colors.border, justifyContent: 'center', padding: 2 },
  toggleActive: { backgroundColor: colors.primary },
  toggleDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.white },
  toggleDotActive: { alignSelf: 'flex-end' },
  sectionInput: { backgroundColor: colors.inputBg, borderRadius: borderRadius.sm, padding: spacing.sm, marginTop: spacing.sm, fontSize: 13, color: colors.text, minHeight: 70, borderWidth: 1, borderColor: colors.border },
  previewBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.md },
  previewBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  exportBtn: { backgroundColor: colors.card, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.sm, borderWidth: 1, borderColor: colors.primary },
  exportBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  aiBtn: { backgroundColor: colors.card, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl },
  aiBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
});
