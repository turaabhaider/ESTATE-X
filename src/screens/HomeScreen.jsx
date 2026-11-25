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
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/theme';
import {
  PROPERTIES,
  CATEGORIES,
  CURATED_COLLECTIONS,
} from '../data/mockData';
import HeaderBar from '../components/HeaderBar';
import FeaturedBanner from '../components/FeaturedBanner';
import PropertyCard from '../components/PropertyCard';
import FilterModal from '../components/FilterModal';

export default function HomeScreen({ navigation }) {
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HeaderBar onOpenCompare={() => navigation.navigate('Compare')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Prominent Search + Filter Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={20}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city, villa, penthouse..."
              placeholderTextColor={COLORS.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterBtn}
            activeOpacity={0.85}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="options-outline" size={21} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Featured Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Estates</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAll}>See All</Text>
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
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={active ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  style={[styles.catLabel, active && styles.catLabelActive]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Nearby / Filtered Listings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all'
              ? 'Nearby Residences'
              : `${selectedCategory} Listings`}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAll}>Explore Map</Text>
          </TouchableOpacity>
        </View>

        {filteredListings.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
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
          <Text style={styles.sectionTitle}>Curated Collections</Text>
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
              style={styles.collectionCard}
              onPress={() => navigation.navigate('Explore')}
            >
              <ImageBackground
                source={{ uri: col.image }}
                style={styles.collectionImg}
                imageStyle={{ borderRadius: RADIUS.lg }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(15, 23, 20, 0.85)']}
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 110,
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
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: COLORS.textPrimary,
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
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
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoriesRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: 10,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catLabelActive: {
    color: COLORS.white,
  },
  horizontalCards: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.sm,
  },
  emptyBox: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  collectionsRow: {
    paddingHorizontal: SPACING.lg,
    gap: 14,
  },
  collectionCard: {
    width: 175,
    height: 125,
    borderRadius: RADIUS.lg,
    ...SHADOWS.subtle,
  },
  collectionImg: {
    flex: 1,
  },
  collectionGrad: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: 12,
    justifyContent: 'flex-end',
  },
  collectionTitle: {
    color: COLORS.white,
    fontSize: 14.5,
    fontWeight: '700',
  },
  collectionCount: {
    color: '#D1D5DB',
    fontSize: 12,
    marginTop: 2,
  },
});