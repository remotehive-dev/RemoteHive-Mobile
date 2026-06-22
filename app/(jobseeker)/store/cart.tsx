import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/theme';
import { getProducts } from '@/lib/api';

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load sample cart data
    getProducts().then(products => {
      setCartItems(products.slice(0, 2).map(p => ({ ...p, quantity: 1 })));
      setLoading(false);
    });
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const updateQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };
  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Cart ({cartItems.length})</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(jobseeker)/store')}>
              <Text style={styles.shopBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartItems.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.images?.[0] }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price.toLocaleString()}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}><Text style={styles.qtyBtnText}>−</Text></TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)}><Text style={styles.removeBtn}>✕</Text></TouchableOpacity>
              </View>
            ))}

            <View style={styles.summary}>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>₹{total.toLocaleString()}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipping</Text><Text style={styles.summaryValue}>₹99</Text></View>
              <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>₹{(total + 99).toLocaleString()}</Text></View>
            </View>

            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  content: { flex: 1, padding: spacing.lg },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  shopBtn: { marginTop: spacing.lg, backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  shopBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  cartItem: { flexDirection: 'row', backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, alignItems: 'center' },
  itemImage: { width: 64, height: 64, borderRadius: borderRadius.sm, backgroundColor: colors.inputBg },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemPrice: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.sm },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.inputBg, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 16, fontWeight: '600', color: colors.text },
  qtyValue: { fontSize: 14, fontWeight: '600', color: colors.text, minWidth: 20, textAlign: 'center' },
  removeBtn: { fontSize: 16, color: colors.error, paddingLeft: spacing.sm },
  summary: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.xs },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  checkoutBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  checkoutBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
