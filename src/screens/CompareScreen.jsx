import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { PROPERTIES } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function CompareScreen({ navigation }) {
  const { compareList, toggleCompare } = useApp();
  const items = PROPERTIES.filter((p) => compareList.includes(p.id));

  const rows = [
    { label: 'Category', getValue: (p) => p.category },
    { label: 'Location', getValue: (p) => p.location },
    {
      label: 'Price / Sq Ft',
      getValue: (p) => `$${Math.round(p.price / p.sqft).toLocaleString()}`,
    },
    {
      label: 'Bedrooms',
      getValue: (p) => (p.beds > 0 ? `${p.beds} Beds` : 'N/A'),
    },
    {
      label: 'Bathrooms',
      getValue: (p) => (p.baths > 0 ? `${p.baths} Baths` : 'N/A'),
    },
    {
      label: 'Total Area',
      getValue: (p) => `${p.sqft.toLocaleString()} sq ft`,
    },
    { label: 'Rating', getValue: (p) => `★ ${p.rating}` },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Compare Estates ({items.length}/3)</Text>
        <View style={{ width: 40 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons
            name="git-compare-outline"
            size={42}
            color={COLORS.primary}
          />
          <Text style={styles.emptyTitle}>No Properties Selected</Text>
          <Text style={styles.emptySub}>
            Tap the compare icon on up to 3 property cards to evaluate them side
            by side.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalWrap}
        >
          <View>
            {/* Property Header Cards */}
            <View style={styles.row}>
              <View style={styles.labelCol} />
              {items.map((prop) => (
                <View key={prop.id} style={styles.propCol}>
                  <View style={styles.card}>
                    <Image
                      source={{ uri: prop.images[0] }}
                      style={styles.cardImg}
                    />
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => toggleCompare(prop.id)}
                    >
                      <Ionicons name="close" size={15} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={styles.cardBody}>
                      <Text style={styles.propTitle} numberOfLines={1}>
                        {prop.title}
                      </Text>
                      <Text style={styles.propPrice}>
                        {prop.priceFormatted}
                        {prop.period}
                      </Text>
                      <TouchableOpacity
                        style={styles.viewBtn}
                        onPress={() =>
                          navigation.navigate('PropertyDetails', {
                            property: prop,
                          })
                        }
                      >
                        <Text style={styles.viewBtnText}>Inspect</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Spec Comparison Rows */}
            {rows.map((r, idx) => (
              <View
                key={r.label}
                style={[
                  styles.row,
                  styles.specRow,
                  idx % 2 === 0 && styles.specRowAlt,
                ]}
              >
                <View style={styles.labelCol}>
                  <Text style={styles.rowLabel}>{r.label}</Text>
                </View>
                {items.map((prop) => (
                  <View key={prop.id} style={styles.propCol}>
                    <Text style={styles.cellValue}>{r.getValue(prop)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  horizontalWrap: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelCol: {
    width: 105,
    paddingRight: 10,
  },
  propCol: {
    width: 180,
    paddingHorizontal: 6,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.subtle,
  },
  cardImg: {
    width: '100%',
    height: 110,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(20,23,26,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: 10,
  },
  propTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  propPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  viewBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  viewBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  specRow: {
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  specRowAlt: {
    backgroundColor: COLORS.surface,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cellValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});