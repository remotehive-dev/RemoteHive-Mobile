import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/theme';
import { getProducts, getProductCategories } from '@/lib/api';

export default function GadgetsStore() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    getProducts().then(setProducts);
    getProductCategories().then(cats => setCategories(['All', ...cats]));
  }, []);

  const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Gadgets Store</Text>
        <TouchableOpacity onPress={() => router.push('/(jobseeker)/store/cart')}>
          <Text style={styles.cartLink}>🛒 {cartCount > 0 ? `(${cartCount})` : ''}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Remote Work Essentials</Text>
        <Text style={styles.heroDesc}>Gear up for productivity with curated gadgets and digital tools</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {categories.map(cat => (
          <TouchableOpacity key={cat} style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]} onPress={() => setActiveCategory(cat)}>
            <Text style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard} onPress={() => router.push({ pathname: '/(jobseeker)/store/checkout', params: { productId: item.id } })}>
            <Image source={{ uri: item.images?.[0] || 'https://picsum.photos/seed/default/400/400' }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
                {item.original_price > item.price && <Text style={styles.originalPrice}>₹{item.original_price.toLocaleString()}</Text>}
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.productRating}>⭐ {item.rating}</Text>
                <Text style={styles.stockText}>{item.in_stock ? 'In Stock' : 'Out of Stock'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products in this category</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.sm, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cartLink: { fontSize: 18 },
  hero: { padding: spacing.lg, backgroundColor: colors.primary },
  heroTitle: { fontSize: 20, fontWeight: '700', color: colors.white },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  filterBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  filterChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: colors.white },
  grid: { padding: spacing.sm },
  row: { gap: spacing.sm, paddingHorizontal: spacing.sm, marginBottom: spacing.sm },
  productCard: { flex: 1, backgroundColor: colors.card, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  productImage: { width: '100%', height: 130, backgroundColor: colors.inputBg },
  productInfo: { padding: spacing.sm },
  productName: { fontSize: 12, fontWeight: '600', color: colors.text, lineHeight: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  price: { fontSize: 14, fontWeight: '700', color: colors.primary },
  originalPrice: { fontSize: 11, color: colors.textTertiary, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  productRating: { fontSize: 11, color: colors.textSecondary },
  stockText: { fontSize: 10, color: colors.success, fontWeight: '600' },
  emptyState: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.textTertiary, fontSize: 14 },
});
