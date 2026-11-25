import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { PROPERTIES, CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import FilterModal from '../components/FilterModal';

export default function ExploreScreen({ navigation }) {
  const { filters, setFilters } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedPin, setSelectedPin] = useState(PROPERTIES[0]);

  const filteredData = PROPERTIES.filter((p) => {
    const matchCategory =
      filters.category === 'all' || p.category === filters.category;
    const matchPrice =
      p.price >= filters.minPrice && p.price <= filters.maxPrice;
    const matchBeds = p.beds >= filters.beds;
    const matchText =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchPrice && matchBeds && matchText;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Search & Toggle Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search neighborhood, address..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setFilterVisible(true)}>
            <Ionicons name="options" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* List / Map Segmented Switch */}
        <View style={styles.toggleWrap}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === 'list' && styles.toggleBtnActive,
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={16}
              color={viewMode === 'list' ? COLORS.white : COLORS.textPrimary}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === 'list' && styles.toggleTextActive,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === 'map' && styles.toggleBtnActive,
            ]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons
              name="map"
              size={16}
              color={viewMode === 'map' ? COLORS.white : COLORS.textPrimary}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === 'map' && styles.toggleTextActive,
              ]}
            >
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Category Strip */}
      <View style={styles.chipRow}>
        {CATEGORIES.map((cat) => {
          const active = filters.category === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilters({ ...filters, category: cat.id })}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main View: List OR Map */}
      {viewMode === 'list' ? (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {filteredData.length} curated{' '}
              {filteredData.length === 1 ? 'property' : 'properties'} available
            </Text>
          }
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() =>
                navigation.navigate('PropertyDetails', { property: item })
              }
            />
          )}
        />
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 34.0901,
              longitude: -118.4065,
              latitudeDelta: 12,
              longitudeDelta: 12,
            }}
          >
            {filteredData.map((prop) => {
              const isSelected = selectedPin?.id === prop.id;
              return (
                <Marker
                  key={prop.id}
                  coordinate={prop.coords}
                  onPress={() => setSelectedPin(prop)}
                >
                  <View
                    style={[
                      styles.pricePin,
                      isSelected && styles.pricePinSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pricePinText,
                        isSelected && styles.pricePinTextSelected,
                      ]}
                    >
                      {prop.priceFormatted}
                    </Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>

          {/* Floating Bottom Property Card on Map */}
          {selectedPin && (
            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.floatingCard}
              onPress={() =>
                navigation.navigate('PropertyDetails', {
                  property: selectedPin,
                })
              }
            >
              <Image
                source={{ uri: selectedPin.images[0] }}
                style={styles.floatingImg}
              />
              <View style={styles.floatingInfo}>
                <Text style={styles.floatingPrice}>
                  {selectedPin.priceFormatted}
                  {selectedPin.period}
                </Text>
                <Text style={styles.floatingTitle} numberOfLines={1}>
                  {selectedPin.title}
                </Text>
                <Text style={styles.floatingLoc} numberOfLines={1}>
                  {selectedPin.location}
                </Text>
                <Text style={styles.floatingSpecs}>
                  {selectedPin.beds > 0 ? `${selectedPin.beds} bd • ` : ''}
                  {selectedPin.sqft.toLocaleString()} sq ft
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 110,
  },
  resultCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pricePin: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.subtle,
  },
  pricePinSelected: {
    backgroundColor: COLORS.primary,
  },
  pricePinText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pricePinTextSelected: {
    color: COLORS.white,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 100,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOWS.medium,
  },
  floatingImg: {
    width: 78,
    height: 78,
    borderRadius: RADIUS.md,
  },
  floatingInfo: {
    flex: 1,
  },
  floatingPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  floatingTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  floatingLoc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  floatingSpecs: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
});