import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { colors, spacing, borderRadius } from '@/theme';
import { getProduct } from '@/lib/api';

export default function Checkout() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (productId) getProduct(productId).then(setProduct);
  }, [productId]);

  if (!product) {
    return <View style={styles.container}><Text style={{ color: colors.text, textAlign: 'center', marginTop: 100 }}>Loading...</Text></View>;
  }

  const total = product.price * qty;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.productDetail}>
        <Image source={{ uri: product.images?.[0] }} style={styles.productImage} />
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDesc}>{product.description}</Text>

        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Quantity</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}><Text style={styles.qtyBtnText}>−</Text></TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{total.toLocaleString()}</Text>
        </View>

        {product.features && (
          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>Features</Text>
            {(product.features as string[]).map((f: string, i: number) => (
              <Text key={i} style={styles.featureItem}>✓ {f}</Text>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.buyBtnText}>Place Order · ₹{total.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  productDetail: { padding: spacing.lg },
  productImage: { width: '100%', height: 200, borderRadius: borderRadius.md, backgroundColor: colors.inputBg, marginBottom: spacing.md },
  productName: { fontSize: 18, fontWeight: '700', color: colors.text },
  productDesc: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  qtyLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.inputBg, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 18, fontWeight: '600', color: colors.text },
  qtyValue: { fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 24, textAlign: 'center' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  priceLabel: { fontSize: 16, color: colors.textSecondary },
  totalPrice: { fontSize: 22, fontWeight: '700', color: colors.primary },
  featuresList: { marginTop: spacing.lg, backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  featuresTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  featureItem: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  buyBtn: { marginTop: spacing.xl, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center' },
  buyBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
