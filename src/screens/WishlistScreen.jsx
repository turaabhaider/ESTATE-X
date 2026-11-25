import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../theme/theme';
import { PROPERTIES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';

export default function WishlistScreen({ navigation }) {
  const { wishlist, compareList } = useApp();
  const savedProperties = PROPERTIES.filter((p) => wishlist.includes(p.id));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Saved Estates</Text>
          <Text style={styles.subtitle}>
            {savedProperties.length}{' '}
            {savedProperties.length === 1 ? 'property' : 'properties'} curated
          </Text>
        </View>

        {compareList.length > 0 && (
          <TouchableOpacity
            style={styles.comparePill}
            onPress={() => navigation.navigate('Compare')}
          >
            <Ionicons
              name="git-compare-outline"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.compareText}>
              Compare ({compareList.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {savedProperties.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={34} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptyDesc}>
            Tap the heart icon on any residence to save and compare your top
            selections here.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.exploreBtnText}>Browse Residences</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedProperties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() =>
                navigation.navigate('PropertyDetails', { property: item })
              }
            />
          )}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  comparePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  compareText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 110,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  exploreBtnText: {
    color: COLORS.white,
    fontSize: 14.5,
    fontWeight: '700',
  },
});