import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../theme/theme';
import { CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';

const PRICE_RANGES = [
  { label: 'Any Budget', min: 0, max: 10000000 },
  { label: 'Under $25k/mo', min: 0, max: 25000 },
  { label: '$1M – $3M', min: 1000000, max: 3000000 },
  { label: '$3M+', min: 3000000, max: 10000000 },
];

const BED_OPTIONS = [0, 1, 2, 3, 4, 5];

export default function FilterModal({ visible, onClose }) {
  const { filters, setFilters } = useApp();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const reset = { category: 'all', minPrice: 0, maxPrice: 10000000, beds: 0 };
    setLocalFilters(reset);
    setFilters(reset);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Refine Search</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Property Type */}
            <Text style={styles.sectionLabel}>Property Type</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((cat) => {
                const active = localFilters.category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() =>
                      setLocalFilters({ ...localFilters, category: cat.id })
                    }
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Budget */}
            <Text style={styles.sectionLabel}>Price Range</Text>
            <View style={styles.chipWrap}>
              {PRICE_RANGES.map((range) => {
                const active =
                  localFilters.minPrice === range.min &&
                  localFilters.maxPrice === range.max;
                return (
                  <TouchableOpacity
                    key={range.label}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        minPrice: range.min,
                        maxPrice: range.max,
                      })
                    }
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bedrooms */}
            <Text style={styles.sectionLabel}>Minimum Bedrooms</Text>
            <View style={styles.bedRow}>
              {BED_OPTIONS.map((num) => {
                const active = localFilters.beds === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[styles.bedPill, active && styles.chipActive]}
                    onPress={() =>
                      setLocalFilters({ ...localFilters, beds: num })
                    }
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {num === 0 ? 'Any' : `${num}+`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyText}>Show Properties</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 23, 26, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  bedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  bedPill: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});