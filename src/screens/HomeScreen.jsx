import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  StyleSheet,
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
import FeaturedBanner from '../components/FeaturedBanner';
import PropertyCard from '../components/PropertyCard';
import FilterModal from '../components/FilterModal';

export default function HomeScreen({ navigation }) {
  const { colors, selectedCity } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const featuredProperties = useMemo(
    () => PROPERTIES.filter((p) => p.featured),
    []
  );

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

  // Avoid showing the exact same lead image as the first Featured card at index 0 of Nearby
  const nearbyCarouselData = useMemo(() => {
    if (selectedCategory === 'all' && !searchText.trim()) {
      return filteredListings.filter((item) => item.id !== 'prop-1');
    }
    return filteredListings;
  }, [filteredListings, selectedCategory, searchText]);

  const openDetails = (property) => {
    navigation.navigate('PropertyDetails', { property });
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <HeaderBar onOpenCompare={() => navigation.navigate('Compare')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Editorial Intro Line */}
        <View style={styles.introBlock}>
          <Text style={[styles.introTitle, { color: colors.textPrimary }]}>
            Architectural homes & private listings
          </Text>
          <Text style={[styles.introSub, { color: colors.textSecondary }]}>
            Handpicked properties currently active around {selectedCity}
          </Text>
        </View>

        {/* Search & Filter Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search neighborhood, residence, city..."
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
            style={[
              styles.filterBtn,
              { backgroundColor: colors.primary },
            ]}
            activeOpacity={0.85}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="options-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Featured Estates */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Featured Estates
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <FeaturedBanner
          properties={featuredProperties}
          onSelectProperty={openDetails}
        />

        {/* Horizontally Scrollable Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                style={[
                  styles.catPill,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={15}
                  color={active ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.catLabel,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                    active && { fontWeight: '700' },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Nearby / Filtered Residences */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {selectedCategory === 'all'
              ? 'Nearby Residences'
              : `${selectedCategory} Listings`}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              Map View
            </Text>
          </TouchableOpacity>
        </View>

        {nearbyCarouselData.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No properties match your current search.
            </Text>
          </View>
        ) : (
          <FlatList
            data={nearbyCarouselData}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PropertyCard
                property={item}
                compact
                onPress={() => openDetails(item)}
              />
            )}
          />
        )}

        {/* Market Snapshot Strip */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Market Pulse
          </Text>
          <Text style={[styles.sectionMeta, { color: colors.textMuted }]}>
            Q4 Report
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsRow}
        >
          {MARKET_INSIGHTS.map((item) => (
            <View
              key={item.id}
              style={[
                styles.insightCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.insightMetric, { color: colors.primary }]}>
                {item.metric}
              </Text>
              <Text style={[styles.insightLabel, { color: colors.textPrimary }]}>
                {item.label}
              </Text>
              <Text style={[styles.insightSub, { color: colors.textSecondary }]}>
                {item.sub}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Curated Collections */}
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
                  colors={['rgba(17,20,19,0.08)', 'rgba(17,20,19,0.84)']}
                  style={styles.collectionGrad}
                >
                  <Text style={styles.collectionTitle}>{col.title}</Text>
                  <Text style={styles.collectionCount}>{col.count}</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Private Concierge Advisory Card */}
        <View
          style={[
            styles.conciergeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.conciergeTop}>
            <View
              style={[
                styles.conciergeIconBox,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.conciergeTitle, { color: colors.textPrimary }]}
              >
                EstateX Private Advisory
              </Text>
              <Text
                style={[styles.conciergeDesc, { color: colors.textSecondary }]}
              >
                Access off-market residences, architectural dossiers, and private
                viewing appointments with dedicated senior advisors.
              </Text>
            </View>
          </View>

          <View style={styles.conciergeActions}>
            <TouchableOpacity
              style={[
                styles.conciergePrimaryBtn,
                { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('MainTabs', { screen: 'Messages' })
              }
            >
              <Text style={styles.conciergePrimaryText}>Message Advisor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.conciergeSecondaryBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Compare')}
            >
              <Text
                style={[
                  styles.conciergeSecondaryText,
                  { color: colors.textPrimary },
                ]}
              >
                Compare Listings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Full Showcase Listings */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Latest Portfolio Additions
          </Text>
          <Text style={[styles.sectionMeta, { color: colors.textMuted }]}>
            {filteredListings.length} homes
          </Text>
        </View>

        <View style={styles.verticalList}>
          {filteredListings.map((item) => (
            <PropertyCard
              key={`feed-${item.id}`}
              property={item}
              onPress={() => openDetails(item)}
            />
          ))}
        </View>
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
    paddingBottom: 40,
  },
  introBlock: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  introSub: {
    fontSize: 13,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: 10,
    marginBottom: SPACING.lg,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionMeta: {
    fontSize: 12.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  horizontalCards: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.sm,
  },
  emptyBox: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  insightsRow: {
    paddingHorizontal: SPACING.lg,
    gap: 12,
  },
  insightCard: {
    width: 164,
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  insightMetric: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
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
  collectionsRow: {
    paddingHorizontal: SPACING.lg,
    gap: 12,
  },
  collectionCard: {
    width: 176,
    height: 122,
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
  conciergeCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  conciergeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  conciergeIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conciergeTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  conciergeDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 3,
  },
  conciergeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  conciergePrimaryBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  conciergePrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  conciergeSecondaryBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  conciergeSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  verticalList: {
    paddingHorizontal: SPACING.lg,
  },
});