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
import { SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { PROPERTIES, CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import FilterModal from '../components/FilterModal';

export default function ExploreScreen({ navigation }) {
  const { filters, setFilters, colors } = useApp();
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Top Search & List/Map Switch */}
      <View style={styles.header}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Search neighborhood, address..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setFilterVisible(true)}>
            <Ionicons name="options-outline" size={19} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.toggleWrap,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === 'list' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list-outline"
              size={15}
              color={viewMode === 'list' ? '#FFFFFF' : colors.textPrimary}
            />
            <Text
              style={[
                styles.toggleText,
                {
                  color: viewMode === 'list' ? '#FFFFFF' : colors.textPrimary,
                },
              ]}
            >
              List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              viewMode === 'map' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons
              name="map-outline"
              size={15}
              color={viewMode === 'map' ? '#FFFFFF' : colors.textPrimary}
            />
            <Text
              style={[
                styles.toggleText,
                {
                  color: viewMode === 'map' ? '#FFFFFF' : colors.textPrimary,
                },
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
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primaryLight : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilters({ ...filters, category: cat.id })}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? colors.primary : colors.textSecondary },
                  active && { fontWeight: '700' },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List or Interactive Map */}
      {viewMode === 'list' ? (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {filteredData.length} curated{' '}
              {filteredData.length === 1 ? 'residence' : 'residences'}
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
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.card,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pricePinText,
                        { color: isSelected ? '#FFFFFF' : colors.primary },
                      ]}
                    >
                      {prop.priceFormatted}
                    </Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>

          {selectedPin && (
            <TouchableOpacity
              activeOpacity={0.92}
              style={[
                styles.floatingCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
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
                <Text style={[styles.floatingPrice, { color: colors.primary }]}>
                  {selectedPin.priceFormatted}
                  {selectedPin.period}
                </Text>
                <Text
                  style={[styles.floatingTitle, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {selectedPin.title}
                </Text>
                <Text
                  style={[styles.floatingLoc, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {selectedPin.location}
                </Text>
                <Text
                  style={[styles.floatingSpecs, { color: colors.textMuted }]}
                >
                  {selectedPin.beds > 0 ? `${selectedPin.beds} bd · ` : ''}
                  {selectedPin.sqft.toLocaleString()} sq ft
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
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
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  toggleWrap: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
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
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 32,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    marginBottom: 12,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pricePin: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    ...SHADOWS.subtle,
  },
  pricePinText: {
    fontSize: 11.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  floatingCard: {
    position: 'absolute',
    bottom: 20,
    left: SPACING.lg,
    right: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  floatingImg: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.md,
  },
  floatingInfo: {
    flex: 1,
  },
  floatingPrice: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  floatingTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    marginTop: 2,
  },
  floatingLoc: {
    fontSize: 12,
    marginTop: 1,
  },
  floatingSpecs: {
    fontSize: 11.5,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
});