import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

export default function ProfileScreen({ navigation }) {
  const { wishlist, bookedTours, compareList } = useApp();

  const menuItems = [
    {
      icon: 'git-compare-outline',
      label: 'Property Comparison Matrix',
      badge: `${compareList.length} selected`,
      onPress: () => navigation.navigate('Compare'),
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Pre-Approval & Financing',
      badge: 'Verified',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      label: 'Market Price Alerts',
      badge: 'Active',
      onPress: () => {},
    },
    {
      icon: 'settings-outline',
      label: 'Preferences & Currency',
      badge: 'USD',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <View style={styles.tierPill}>
              <Ionicons name="diamond-outline" size={12} color={COLORS.primary} />
              <Text style={styles.tierText}>Private Client</Text>
            </View>
            <Text style={styles.userName}>Alex Morgan</Text>
            <Text style={styles.userEmail}>alex.morgan@estatex.io</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{wishlist.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{bookedTours.length}</Text>
            <Text style={styles.statLabel}>Viewings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{compareList.length}</Text>
            <Text style={styles.statLabel}>Comparing</Text>
          </View>
        </View>

        {/* Scheduled Viewings */}
        <Text style={styles.sectionTitle}>Scheduled Private Viewings</Text>
        {bookedTours.length === 0 ? (
          <View style={styles.emptyTourBox}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyTourText}>
              No upcoming viewings yet. Open any property to book a tour.
            </Text>
          </View>
        ) : (
          bookedTours.map((tour) => (
            <View key={tour.id} style={styles.tourCard}>
              <View style={styles.tourBadge}>
                <Ionicons name="calendar" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tourTitle}>{tour.property.title}</Text>
                <Text style={styles.tourMeta}>
                  {tour.dateLabel} at {tour.timeLabel} • {tour.property.agent.name}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Settings Menu */}
        <Text style={styles.sectionTitle}>Account & Tools</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuRow,
                idx < menuItems.length - 1 && styles.menuBorder,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={19} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuBadge}>{item.badge}</Text>
              <Ionicons
                name="chevron-forward"
                size={17}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: 4,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  emptyTourBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  emptyTourText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  tourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 14,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    gap: 12,
  },
  tourBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tourMeta: {
    fontSize: 12.5,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuBadge: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
});