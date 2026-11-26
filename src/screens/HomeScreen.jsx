import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS, SHADOWS } from '../theme/theme';
import {
  PROPERTIES,
  CATEGORIES,
  CURATED_COLLECTIONS,
  MARKET_INSIGHTS,
} from '../data/mockData';
import { useApp } from '../context/AppContext';
import HeaderBar from '../components/HeaderBar';
import FilterModal from '../components/FilterModal';

const { width } = Dimensions.get('window');
const REC_CARD_WIDTH = width * 0.68;

export default function HomeScreen({ navigation }) {
  const { colors, wishlist, toggleWishlist, compareList, toggleCompare, filters } =
    useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const hasActiveModalFilters =
    filters.category !== 'all' ||
    filters.minPrice > 0 ||
    filters.maxPrice < 10000000 ||
    filters.beds > 0;

  const filteredListings = useMemo(() => {
    return PROPERTIES.filter((item) => {
      const effectiveCat =
        selectedCategory !== 'all' ? selectedCategory : filters.category;
      const matchesCategory =
        effectiveCat === 'all' || item.category === effectiveCat;
      const matchesPrice =
        item.price >= filters.minPrice && item.price <= filters.maxPrice;
      const matchesBeds = item.beds >= filters.beds;
      const matchesSearch =
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location.toLowerCase().includes(searchText.toLowerCase());
      return matchesCategory && matchesPrice && matchesBeds && matchesSearch;
    });
  }, [selectedCategory, searchText, filters]);

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
    const isComparing = compareList.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => openDetails(item)}
        style={[
          styles.recCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {/* Framed Architectural Image */}
        <View style={styles.recImageWrap}>
          <Image source={{ uri: item.images[0] }} style={styles.recImage} />

          {item.badge && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: 'rgba(17, 20, 19, 0.72)' },
              ]}
            >
              <Text style={styles.statusBadgeText}>{item.badge}</Text>
            </View>
          )}

          <View style={styles.recCardActions}>
            <TouchableOpacity
              style={[
                styles.recCircleBtn,
                {
                  backgroundColor: isComparing ? colors.primary : colors.card,
                  borderColor: isComparing ? colors.primary : colors.border,
                },
              ]}
              onPress={() => toggleCompare(item.id)}
            >
              <Ionicons
                name="git-compare-outline"
                size={14}
                color={isComparing ? '#FFFFFF' : colors.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.recCircleBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => toggleWishlist(item.id)}
            >
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={15}
                color={isSaved ? colors.danger : colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
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
            <Ionicons name="star" size={12.5} color={colors.gold} />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {item.rating}
            </Text>
          </View>
        </View>

        {/* Title & Pin Location */}
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

        {/* Specs & Emerald Price Footer */}
        <View style={[styles.recFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.recPrice, { color: colors.primary }]}>
            {item.priceFormatted}
            <Text style={[styles.recPeriod, { color: colors.textSecondary }]}>
              {item.period}
            </Text>
          </Text>

          <Text style={[styles.recSpecs, { color: colors.textMuted }]}>
            {item.beds > 0 ? `${item.beds} bd · ` : ''}
            {item.sqft.toLocaleString()} ft²
          </Text>
        </View>
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
        {/* Clean Search Input + Solid Emerald Filter Button */}
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
              placeholder="Search residences, neighborhoods..."
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
            {hasActiveModalFilters && <View style={styles.activeFilterDot} />}
          </TouchableOpacity>
        </View>

        {/* Circular Category Medallions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.circleCatScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.82}
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
                    size={21}
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
        </ScrollView>

        {/* Recommended Property Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Recommended Property
            </Text>
          </View>
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
              Map view
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

                  <View style={styles.locRowCompact}>
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

                    <View style={styles.nearbyRightMeta}>
                      <Text
                        style={[
                          styles.nearbySpecs,
                          { color: colors.textMuted },
                        ]}
                      >
                        {item.beds > 0 ? `${item.beds} bd · ` : ''}
                        {item.sqft.toLocaleString()} ft²
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
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Curated Architectural Collections */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Curated Collections
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              Explore
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionsRow}
        >
          {CURATED_COLLECTIONS.map((col) => (
            <TouchableOpacity
              key={col.id}
              activeOpacity={0.9}
              style={[styles.collectionCard, { borderColor: colors.border }]}
              onPress={() => navigation.navigate('Explore')}
            >
              <ImageBackground
                source={{ uri: col.image }}
                style={styles.collectionImg}
                imageStyle={{ borderRadius: RADIUS.lg }}
              >
                <LinearGradient
                  colors={['rgba(17,20,19,0.06)', 'rgba(17,20,19,0.84)']}
                  style={styles.collectionGrad}
                >
                  <Text style={styles.collectionTitle}>{col.title}</Text>
                  <Text style={styles.collectionCount}>{col.count}</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Market Pulse Strip */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Market Pulse
          </Text>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
            Q4 Advisory
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
              <View style={styles.insightTopRow}>
                <Text style={[styles.insightMetric, { color: colors.primary }]}>
                  {ins.metric}
                </Text>
                <View
                  style={[
                    styles.trendPill,
                    { backgroundColor: colors.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="trending-up"
                    size={13}
                    color={colors.primary}
                  />
                </View>
              </View>
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
    paddingBottom: 38,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: 10,
    marginBottom: SPACING.md,
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
    position: 'relative',
    ...SHADOWS.subtle,
  },
  activeFilterDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D4A838',
  },
  circleCatScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    gap: 16,
    marginBottom: SPACING.md,
  },
  circleCatItem: {
    alignItems: 'center',
    width: 64,
  },
  circleMedallion: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 7,
  },
  circleCatLabel: {
    fontSize: 12,
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
    fontWeight: '800',
    letterSpacing: -0.35,
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
    height: 158,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  recImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  recCardActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  recCircleBtn: {
    width: 31,
    height: 31,
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
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.25,
    marginBottom: 3,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  locRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recLocation: {
    fontSize: 12,
    flex: 1,
  },
  recFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 9,
    borderTopWidth: 1,
  },
  recPrice: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  recPeriod: {
    fontSize: 11.5,
    fontWeight: '400',
  },
  recSpecs: {
    fontSize: 11.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
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
    width: 98,
    height: 98,
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
  nearbyRightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nearbySpecs: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  nearbyPrice: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  collectionsRow: {
    paddingHorizontal: SPACING.lg,
    gap: 12,
  },
  collectionCard: {
    width: 178,
    height: 124,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  collectionImg: {
    flex: 1,
  },
  collectionGrad: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-end',
  },
  collectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  collectionCount: {
    color: '#D8DEDB',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  insightsRow: {
    paddingHorizontal: SPACING.lg,
    gap: 12,
  },
  insightCard: {
    width: 172,
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  insightTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendPill: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightMetric: {
    fontSize: 19,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  insightLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  insightSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
});