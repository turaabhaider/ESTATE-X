import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS } from '../theme/theme';
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
  const { filters, setFilters, colors } = useApp();
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

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
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Refine Search
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              Property Type
            </Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((cat) => {
                const active = localFilters.category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() =>
                      setLocalFilters({ ...localFilters, category: cat.id })
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              Price Range
            </Text>
            <View style={styles.chipWrap}>
              {PRICE_RANGES.map((range) => {
                const active =
                  localFilters.minPrice === range.min &&
                  localFilters.maxPrice === range.max;
                return (
                  <TouchableOpacity
                    key={range.label}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        minPrice: range.min,
                        maxPrice: range.max,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
              Minimum Bedrooms
            </Text>
            <View style={styles.bedRow}>
              {BED_OPTIONS.map((num) => {
                const active = localFilters.beds === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.bedPill,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() =>
                      setLocalFilters({ ...localFilters, beds: num })
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {num === 0 ? 'Any' : `${num}+`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.resetBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={handleReset}
            >
              <Text style={[styles.resetText, { color: colors.textPrimary }]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
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
    backgroundColor: 'rgba(17, 20, 19, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  bedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  bedPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  resetText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});