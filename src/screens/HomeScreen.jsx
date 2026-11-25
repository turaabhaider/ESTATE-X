import React, { useState } from 'react';
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
} from '../data/mockData';
import { useApp } from '../context/AppContext';
import HeaderBar from '../components/HeaderBar';
import FeaturedBanner from '../components/FeaturedBanner';
import PropertyCard from '../components/PropertyCard';
import FilterModal from '../components/FilterModal';

export default function HomeScreen({ navigation }) {
  const { colors } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const featuredProperties = PROPERTIES.filter((p) => p.featured);

  const filteredListings = PROPERTIES.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.location.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        {/* Architectural Search & Filter Bar */}
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
              placeholder="Search city, villa, penthouse..."
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
              {
                backgroundColor: colors.primary,
              },
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

        {filteredListings.length === 0 ? (
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
            data={filteredListings}
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

        {/* Curated Collections */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Curated Collections
          </Text>
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
                  colors={['rgba(17,20,19,0.08)', 'rgba(17,20,19,0.82)']}
                  style={styles.collectionGrad}
                >
                  <Text style={styles.collectionTitle}>{col.title}</Text>
                  <Text style={styles.collectionCount}>{col.count}</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
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
    paddingBottom: 32,
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
});