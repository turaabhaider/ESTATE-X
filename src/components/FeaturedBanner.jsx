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
import { SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.84;

export default function FeaturedBanner({ properties, onSelectProperty }) {
  const { wishlist, toggleWishlist, colors } = useApp();

  const renderItem = ({ item }) => {
    const isSaved = wishlist.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => onSelectProperty(item)}
        style={[
          styles.cardWrapper,
          { borderColor: colors.border },
        ]}
      >
        <ImageBackground
          source={{ uri: item.images[0] }}
          style={styles.image}
          imageStyle={styles.imageStyle}
        >
          <LinearGradient
            colors={['rgba(17,20,19,0.06)', 'rgba(17,20,19,0.82)']}
            style={styles.gradient}
          >
            {/* Top Row: Editorial Tag & Save Action */}
            <View style={styles.topRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.favBtn,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => toggleWishlist(item.id)}
              >
                <Ionicons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={17}
                  color={isSaved ? colors.danger : colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {/* Bottom Row: Property Title, Location, Price & Specs */}
            <View>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.location} numberOfLines={1}>
                {item.location}
              </Text>

              <View style={styles.footerRow}>
                <Text style={styles.price}>
                  {item.priceFormatted}
                  <Text style={styles.period}>{item.period}</Text>
                </Text>

                <View style={styles.specsRow}>
                  {item.beds > 0 && (
                    <Text style={styles.specText}>{item.beds} bd</Text>
                  )}
                  {item.baths > 0 && (
                    <Text style={styles.specText}>{item.baths} ba</Text>
                  )}
                  <Text style={styles.specText}>
                    {item.sqft.toLocaleString()} ft²
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
    height: 224,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  image: {
    flex: 1,
  },
  imageStyle: {
    borderRadius: RADIUS.lg,
  },
  gradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  favBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: '#D8DEDB',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  period: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#D8DEDB',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  specText: {
    color: '#E6ECE9',
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});