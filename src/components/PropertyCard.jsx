import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

export default function PropertyCard({ property, onPress, compact = false }) {
  const { wishlist, toggleWishlist, compareList, toggleCompare, colors } =
    useApp();
  const isSaved = wishlist.includes(property.id);
  const isComparing = compareList.includes(property.id);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        compact && styles.compactCard,
      ]}
    >
      <View style={[styles.imageBox, compact && styles.compactImageBox]}>
        <Image source={{ uri: property.images[0] }} style={styles.image} />

        <View
          style={[
            styles.categoryTag,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.categoryText, { color: colors.textPrimary }]}>
            {property.category}
          </Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={[
              styles.circleBtn,
              {
                backgroundColor: isComparing ? colors.primary : colors.card,
                borderColor: isComparing ? colors.primary : colors.border,
              },
            ]}
            onPress={() => toggleCompare(property.id)}
          >
            <Ionicons
              name="git-compare-outline"
              size={15}
              color={isComparing ? '#FFFFFF' : colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.circleBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => toggleWishlist(property.id)}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={16}
              color={isSaved ? colors.danger : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.textPrimary }]}>
            {property.priceFormatted}
            <Text style={[styles.period, { color: colors.textSecondary }]}>
              {property.period}
            </Text>
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12.5} color={colors.gold} />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {property.rating}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {property.title}
        </Text>

        <Text
          style={[styles.location, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {property.location}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.specsRow}>
          {property.beds > 0 && (
            <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
              {property.beds} bd
            </Text>
          )}
          {property.baths > 0 && (
            <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
              {property.baths} ba
            </Text>
          )}
          <Text style={[styles.specLabel, { color: colors.textSecondary }]}>
            {property.sqft.toLocaleString()} sq ft
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  compactCard: {
    width: 268,
    marginRight: SPACING.md,
    marginBottom: 4,
  },
  imageBox: {
    height: 192,
    width: '100%',
    position: 'relative',
  },
  compactImageBox: {
    height: 152,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  topActions: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    padding: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  period: {
    fontSize: 13,
    fontWeight: '400',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 15.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  specLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});