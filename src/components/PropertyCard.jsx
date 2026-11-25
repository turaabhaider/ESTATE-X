import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

export default function PropertyCard({ property, onPress, compact = false }) {
  const { wishlist, toggleWishlist, compareList, toggleCompare } = useApp();
  const isSaved = wishlist.includes(property.id);
  const isComparing = compareList.includes(property.id);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, compact && styles.compactCard]}
    >
      <View style={[styles.imageBox, compact && styles.compactImageBox]}>
        <Image source={{ uri: property.images[0] }} style={styles.image} />

        {/* Category / Status Pill */}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{property.category}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.circleBtn, isComparing && styles.compareActiveBtn]}
            onPress={() => toggleCompare(property.id)}
          >
            <Ionicons
              name="git-compare-outline"
              size={16}
              color={isComparing ? COLORS.white : COLORS.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => toggleWishlist(property.id)}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={17}
              color={isSaved ? COLORS.danger : COLORS.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {property.priceFormatted}
            <Text style={styles.period}>{property.period}</Text>
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={COLORS.gold} />
            <Text style={styles.ratingText}>{property.rating}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {property.location}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.specsRow}>
          {property.beds > 0 && (
            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={15} color={COLORS.primary} />
              <Text style={styles.specLabel}>{property.beds} Beds</Text>
            </View>
          )}
          {property.baths > 0 && (
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={15} color={COLORS.primary} />
              <Text style={styles.specLabel}>{property.baths} Baths</Text>
            </View>
          )}
          <View style={styles.specItem}>
            <Ionicons name="resize-outline" size={15} color={COLORS.primary} />
            <Text style={styles.specLabel}>
              {property.sqft.toLocaleString()} sq ft
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  compactCard: {
    width: 270,
    marginRight: SPACING.md,
    marginBottom: 4,
  },
  imageBox: {
    height: 195,
    width: '100%',
    position: 'relative',
  },
  compactImageBox: {
    height: 155,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  topActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareActiveBtn: {
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  period: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});