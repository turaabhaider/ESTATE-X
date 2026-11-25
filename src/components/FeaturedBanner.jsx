import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;

export default function FeaturedBanner({ properties, onSelectProperty }) {
  const { wishlist, toggleWishlist } = useApp();

  const renderItem = ({ item }) => {
    const isSaved = wishlist.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onSelectProperty(item)}
        style={styles.cardWrapper}
      >
        <ImageBackground
          source={{ uri: item.images[0] }}
          style={styles.image}
          imageStyle={styles.imageStyle}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.08)', 'rgba(15,23,20,0.82)']}
            style={styles.gradient}
          >
            {/* Top Row: Badge & Favorite */}
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <Ionicons name="sparkles" size={12} color={COLORS.white} />
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>

              <TouchableOpacity
                style={styles.favBtn}
                onPress={() => toggleWishlist(item.id)}
              >
                <Ionicons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={19}
                  color={isSaved ? COLORS.danger : COLORS.white}
                />
              </TouchableOpacity>
            </View>

            {/* Bottom Row: Info & Price */}
            <View>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#D1D5DB" />
                <Text style={styles.location} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.price}>
                  {item.priceFormatted}
                  <Text style={styles.period}>{item.period}</Text>
                </Text>

                <View style={styles.specsPill}>
                  {item.beds > 0 && (
                    <Text style={styles.specText}>{item.beds} bd</Text>
                  )}
                  {item.baths > 0 && (
                    <Text style={styles.specText}>• {item.baths} ba</Text>
                  )}
                  <Text style={styles.specText}>
                    • {item.sqft.toLocaleString()} ft²
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={properties}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + SPACING.md}
      decelerationRate="fast"
      contentContainerStyle={styles.listContent}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 230,
    borderRadius: RADIUS.xl,
    ...SHADOWS.medium,
  },
  image: {
    flex: 1,
  },
  imageStyle: {
    borderRadius: RADIUS.xl,
  },
  gradient: {
    flex: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  favBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  location: {
    fontSize: 13,
    color: '#E5E7EB',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.white,
  },
  period: {
    fontSize: 13,
    fontWeight: '500',
    color: '#D1D5DB',
  },
  specsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  specText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});