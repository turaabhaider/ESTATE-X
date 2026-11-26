import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, SHADOWS } from '../theme/theme';
import {
  PROPERTIES,
  CATEGORIES,
  MARKET_INSIGHTS,
} from '../data/mockData';
import { useApp } from '../context/AppContext';
import HeaderBar from '../components/HeaderBar';
import FilterModal from '../components/FilterModal';

const { width } = Dimensions.get('window');
const REC_CARD_WIDTH = width * 0.64;

export default function HomeScreen({ navigation }) {
  const { colors, wishlist, toggleWishlist } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const filteredListings = useMemo(() => {
    return PROPERTIES.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location.toLowerCase().includes(searchText.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchText]);

  const recommendedList = useMemo(() => {
    return filteredListings.length > 0 ? filteredListings : PROPERTIES;
  }, [filteredListings]);

  const nearbyList = useMemo(() => {
    const others = filteredListings.filter((_, idx) => idx !== 0);
    return others.length > 0 ? others : PROPERTIES.slice(1);
  }, [filteredListings]);

  const openDetails = (property) => {
    navigation.navigate('PropertyDetails', { property });
  };

  const renderRecommendedCard = ({ item }) => {
    const isSaved = wishlist.includes(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => openDetails(item)}
        style={[
          styles.recCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {/* Framed Top Photo */}
        <View style={styles.recImageWrap}>
          <Image source={{ uri: item.images[0] }} style={styles.recImage} />
          <TouchableOpacity
            style={[
              styles.recHeartBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => toggleWishlist(item.id)}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={16}
              color={isSaved ? colors.danger : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Category Pill & Star Rating */}
        <View style={styles.recMetaRow}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
              {item.category}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={colors.gold} />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {item.rating}
            </Text>
          </View>
        </View>

        {/* Title, Pin Location & Price */}
        <Text
          style={[styles.recTitle, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <View style={styles.locRow}>
          <Ionicons
            name="location-outline"
            size={13}
            color={colors.textSecondary}
          />
          <Text
            style={[styles.recLocation, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.location}
          </Text>
        </View>

        <Text style={[styles.recPrice, { color: colors.primary }]}>
          {item.priceFormatted}
          <Text style={[styles.recPeriod, { color: colors.textSecondary }]}>
            {item.period || ' / total'}
          </Text>
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <HeaderBar
        onOpenCompare={() => navigation.navigate('Compare')}
        onOpenProfile={() =>
          navigation.navigate('MainTabs', { screen: 'Profile' })
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Clean Search Bar + Solid Emerald Filter Square */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchInputBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textMuted}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search"
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons
                  name="close-circle"
                  size={17}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.filterSquare, { backgroundColor: colors.primary }]}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="options-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Circular Category Medallions */}
        <View style={styles.circleCatGrid}>
          {CATEGORIES.slice(0, 4).map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                style={styles.circleCatItem}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <View
                  style={[
                    styles.circleMedallion,
                    {
                      backgroundColor: active
                        ? colors.primary
                        : colors.primaryLight,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={22}
                    color={active ? '#FFFFFF' : colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.circleCatLabel,
                    {
                      color: active ? colors.primary : colors.textSecondary,
                      fontWeight: active ? '700' : '600',
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recommended Property Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recommended Property
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recommendedList}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={REC_CARD_WIDTH + 14}
          decelerationRate="fast"
          contentContainerStyle={styles.recListContent}
          keyExtractor={(item) => item.id}
          renderItem={renderRecommendedCard}
        />

        {/* Nearby Property Horizontal Row Cards */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Nearby Property
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nearbyList}>
          {nearbyList.map((item) => {
            const isSaved = wishlist.includes(item.id);
            return (
              <TouchableOpacity
                key={`nearby-${item.id}`}
                activeOpacity={0.9}
                onPress={() => openDetails(item)}
                style={[
                  styles.nearbyCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.nearbyThumb}
                />

                <View style={styles.nearbyBody}>
                  <View style={styles.nearbyTopRow}>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryBadgeText,
                          { color: colors.primary },
                        ]}
                      >
                        {item.category}
                      </Text>
                    </View>

                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12.5} color={colors.gold} />
                      <Text
                        style={[
                          styles.ratingText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.rating}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.nearbyTitle, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  <View style={styles.locRow}>
                    <Ionicons
                      name="location-outline"
                      size={12.5}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.nearbyLocation,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.location}
                    </Text>
                  </View>

                  <View style={styles.nearbyBottomRow}>
                    <Text
                      style={[styles.nearbyPrice, { color: colors.primary }]}
                    >
                      {item.priceFormatted}
                      <Text
                        style={[
                          styles.recPeriod,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.period}
                      </Text>
                    </Text>

                    <TouchableOpacity
                      onPress={() => toggleWishlist(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={isSaved ? 'heart' : 'heart-outline'}
                        size={17}
                        color={isSaved ? colors.danger : colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Market Pulse Strip */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Market Pulse
          </Text>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
            Q4 Data
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsRow}
        >
          {MARKET_INSIGHTS.map((ins) => (
            <View
              key={ins.id}
              style={[
                styles.insightCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.insightMetric, { color: colors.primary }]}>
                {ins.metric}
              </Text>
              <Text
                style={[styles.insightLabel, { color: colors.textPrimary }]}
              >
                {ins.label}
              </Text>
              <Text
                style={[styles.insightSub, { color: colors.textSecondary }]}
              >
                {ins.sub}
              </Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: 10,
    marginBottom: SPACING.lg,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterSquare: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  circleCatGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  circleCatItem: {
    alignItems: 'center',
    width: '22%',
  },
  circleMedallion: {
    width: 58,
    height: 58,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 8,
  },
  circleCatLabel: {
    fontSize: 12.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17.5,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  recListContent: {
    paddingHorizontal: SPACING.lg,
    gap: 14,
  },
  recCard: {
    width: REC_CARD_WIDTH,
    borderRadius: RADIUS.lg,
    padding: 10,
    borderWidth: 1,
    ...SHADOWS.subtle,
  },
  recImageWrap: {
    height: 152,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  recImage: {
    width: '100%',
    height: '100%',
  },
  recHeartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  recMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  recLocation: {
    fontSize: 12,
    flex: 1,
  },
  recPrice: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  recPeriod: {
    fontSize: 11.5,
    fontWeight: '400',
  },
  nearbyList: {
    paddingHorizontal: SPACING.lg,
    gap: 12,
  },
  nearbyCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 12,
    ...SHADOWS.subtle,
  },
  nearbyThumb: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.md,
  },
  nearbyBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nearbyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nearbyTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  nearbyLocation: {
    fontSize: 12,
    flex: 1,
  },
  nearbyBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nearbyPrice: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  insightsRow: {
    paddingHorizontal: SPACING.lg,
    gap: 12,
  },
  insightCard: {
    width: 160,
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  insightMetric: {
    fontSize: 19,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  insightLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  insightSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
});