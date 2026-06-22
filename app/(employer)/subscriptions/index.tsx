import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/theme';
import { getPricingPlans } from '@/lib/api';

export default function Subscriptions() {
  const router = useRouter();
  const plans = getPricingPlans();
  const [selectedPlan, setSelectedPlan] = useState('free');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Choose Your Plan</Text>
        <Text style={styles.heroDesc}>Unlock more job posts and premium features as you grow</Text>
      </View>

      <View style={styles.currentPlan}>
        <Text style={styles.currentLabel}>Current Plan</Text>
        <Text style={styles.currentName}>Free</Text>
        <View style={styles.quotaBar}>
          <View style={styles.quotaLabelRow}>
            <Text style={styles.quotaLabel}>Job Posts</Text>
            <Text style={styles.quotaLabel}>0 / 1 used</Text>
          </View>
          <View style={styles.quotaBg}><View style={[styles.quotaFill, { width: '0%' }]} /></View>
        </View>
        <View style={styles.quotaBar}>
          <View style={styles.quotaLabelRow}>
            <Text style={styles.quotaLabel}>Applications</Text>
            <Text style={styles.quotaLabel}>0 / 10</Text>
          </View>
          <View style={styles.quotaBg}><View style={[styles.quotaFill, { width: '0%' }]} /></View>
        </View>
      </View>

      <ScrollView style={styles.plansList} horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {plans.map(plan => (
          <TouchableOpacity key={plan.id} style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]} onPress={() => setSelectedPlan(plan.id)}>
            {plan.id === 'starter' && <View style={styles.recommendedBadge}><Text style={styles.recommendedText}>POPULAR</Text></View>}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>₹{plan.price.toLocaleString()}<Text style={styles.planPeriod}>/mo</Text></Text>
            {plan.price === 0 && <Text style={styles.freeText}>Free</Text>}
            {plan.job_posts > 0 ? <Text style={styles.planDetail}>{plan.job_posts === -1 ? 'Unlimited' : plan.job_posts} job posts</Text> : null}
            {plan.applications > 0 ? <Text style={styles.planDetail}>{plan.applications === -1 ? 'Unlimited' : plan.applications} applications/mo</Text> : null}
            <View style={styles.featureList}>
              {plan.features.map((f: string, i: number) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.selectBtn, selectedPlan === plan.id && styles.selectBtnActive]} onPress={() => setSelectedPlan(plan.id)}>
              <Text style={[styles.selectBtnText, selectedPlan === plan.id && styles.selectBtnTextActive]}>
                {plan.price === 0 ? 'Current' : selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.upgradeSection}>
        <Text style={styles.upgradeTitle}>Need More?</Text>
        <Text style={styles.upgradeDesc}>Contact us for custom enterprise plans with dedicated support and custom integrations.</Text>
        <TouchableOpacity style={styles.contactBtn}><Text style={styles.contactBtnText}>Contact Sales</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  hero: { padding: spacing.lg, backgroundColor: colors.secondary },
  heroTitle: { fontSize: 20, fontWeight: '700', color: colors.white },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  currentPlan: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.card, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  currentLabel: { fontSize: 12, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 },
  currentName: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 2 },
  quotaBar: { marginTop: spacing.md },
  quotaLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  quotaLabel: { fontSize: 12, color: colors.textSecondary },
  quotaBg: { height: 6, backgroundColor: colors.inputBg, borderRadius: 3, overflow: 'hidden' },
  quotaFill: { height: '100%', backgroundColor: colors.secondary, borderRadius: 3 },
  plansList: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  planCard: { width: 280, backgroundColor: colors.card, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 2, borderColor: colors.border, marginRight: spacing.md },
  planCardSelected: { borderColor: colors.secondary },
  recommendedBadge: { alignSelf: 'flex-start', backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: spacing.sm },
  recommendedText: { color: colors.white, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  planName: { fontSize: 16, fontWeight: '600', color: colors.text },
  planPrice: { fontSize: 28, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  planPeriod: { fontSize: 14, fontWeight: '400', color: colors.textTertiary },
  freeText: { fontSize: 28, fontWeight: '700', color: colors.success, marginTop: spacing.sm },
  planDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  featureList: { marginTop: spacing.md, gap: spacing.xs },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  featureCheck: { fontSize: 13, color: colors.success, fontWeight: '700' },
  featureText: { fontSize: 13, color: colors.textSecondary },
  selectBtn: { marginTop: spacing.lg, paddingVertical: 10, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  selectBtnActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  selectBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  selectBtnTextActive: { color: colors.white },
  upgradeSection: { margin: spacing.lg, padding: spacing.lg, backgroundColor: colors.primaryLight + '15', borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.primaryLight },
  upgradeTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  upgradeDesc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, lineHeight: 18 },
  contactBtn: { marginTop: spacing.md, backgroundColor: colors.secondary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  contactBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});
