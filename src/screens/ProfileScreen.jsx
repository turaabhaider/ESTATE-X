import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

export default function ProfileScreen({ navigation }) {
  const { wishlist, bookedTours, compareList, isDarkMode, toggleTheme, colors } =
    useApp();

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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <View
              style={[styles.tierPill, { backgroundColor: colors.primaryLight }]}
            >
              <Ionicons name="diamond-outline" size={12} color={colors.primary} />
              <Text style={[styles.tierText, { color: colors.primary }]}>
                Private Client
              </Text>
            </View>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              Alex Morgan
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              alex.morgan@estatex.io
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View
          style={[
            styles.statsRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: colors.primary }]}>
              {wishlist.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Saved
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: colors.primary }]}>
              {bookedTours.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Viewings
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: colors.primary }]}>
              {compareList.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Comparing
            </Text>
          </View>
        </View>

        {/* Scheduled Viewings */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Scheduled Private Viewings
        </Text>
        {bookedTours.length === 0 ? (
          <View
            style={[
              styles.emptyTourBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={22}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTourText, { color: colors.textSecondary }]}>
              No upcoming viewings yet. Open any property to book a tour.
            </Text>
          </View>
        ) : (
          bookedTours.map((tour) => (
            <View
              key={tour.id}
              style={[
                styles.tourCard,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <View
                style={[styles.tourBadge, { backgroundColor: colors.card }]}
              >
                <Ionicons name="calendar" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tourTitle, { color: colors.textPrimary }]}>
                  {tour.property.title}
                </Text>
                <Text style={[styles.tourMeta, { color: colors.primary }]}>
                  {tour.dateLabel} at {tour.timeLabel} •{' '}
                  {tour.property.agent.name}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Settings Menu */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Appearance & Account
        </Text>
        <View
          style={[
            styles.menuCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Obsidian-Emerald Dark Mode Toggle */}
          <View style={[styles.menuRow, styles.menuBorder, { borderBottomColor: colors.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: colors.surface }]}>
              <Ionicons
                name={isDarkMode ? 'moon' : 'sunny-outline'}
                size={19}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                Obsidian Dark Mode
              </Text>
              <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                {isDarkMode ? 'Obsidian-Emerald active' : 'Crisp Light active'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuRow,
                idx < menuItems.length - 1 && [
                  styles.menuBorder,
                  { borderBottomColor: colors.border },
                ],
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={item.icon} size={19} color={colors.primary} />
              </View>
              <Text
                style={[styles.menuLabel, { flex: 1, color: colors.textPrimary }]}
              >
                {item.label}
              </Text>
              <Text style={[styles.menuBadge, { color: colors.primary }]}>
                {item.badge}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={17}
                color={colors.textMuted}
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
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
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
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: 4,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    borderWidth: 1,
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
  },
  statLabel: {
    fontSize: 12.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyTourBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  emptyTourText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  tourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    gap: 12,
  },
  tourBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  tourMeta: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
  },
  menuCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
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
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  menuSub: {
    fontSize: 12,
    marginTop: 1,
  },
  menuBadge: {
    fontSize: 12.5,
    fontWeight: '600',
  },
});