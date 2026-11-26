import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { CITIES } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function HeaderBar({ onOpenCompare, onOpenProfile }) {
  const {
    selectedCity,
    setSelectedCity,
    compareList,
    isDarkMode,
    toggleTheme,
    colors,
  } = useApp();
  const [cityModalVisible, setCityModalVisible] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Left: Market Selector */}
      <View style={styles.leftCol}>
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
          ESTATEX PORTFOLIO
        </Text>
        <TouchableOpacity
          style={styles.locationRow}
          activeOpacity={0.75}
          onPress={() => setCityModalVisible(true)}
        >
          <Ionicons name="location" size={15} color={colors.primary} />
          <Text
            style={[styles.cityText, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {selectedCity}
          </Text>
          <View
            style={[
              styles.chevronCircle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="chevron-down"
              size={12}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Right: Theme Switch, Compare Counter & Client Avatar */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.iconBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          activeOpacity={0.8}
          onPress={toggleTheme}
        >
          <Ionicons
            name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
            size={17}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        {compareList.length > 0 && (
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.8}
            onPress={onOpenCompare}
          >
            <Ionicons
              name="git-compare-outline"
              size={17}
              color={colors.primary}
            />
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{compareList.length}</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenProfile}
          style={[styles.avatarWrap, { borderColor: colors.primary }]}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            }}
            style={styles.avatar}
          />
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: colors.primary, borderColor: colors.background },
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Market Selection Modal */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCityModalVisible(false)}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Select Market
                </Text>
                <Text
                  style={[styles.modalSub, { color: colors.textSecondary }]}
                >
                  Filter portfolio by metropolitan region
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCityModalVisible(false)}
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Ionicons name="close" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const active = item === selectedCity;
                return (
                  <TouchableOpacity
                    style={[
                      styles.cityOption,
                      {
                        backgroundColor: active
                          ? colors.primaryLight
                          : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      setSelectedCity(item);
                      setCityModalVisible(false);
                    }}
                  >
                    <View style={styles.cityOptionLeft}>
                      <Ionicons
                        name={active ? 'location' : 'location-outline'}
                        size={17}
                        color={active ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.cityOptionText,
                          { color: colors.textPrimary },
                          active && { color: colors.primary, fontWeight: '700' },
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={19}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 14,
  },
  leftCol: {
    flex: 1,
    paddingRight: 10,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cityText: {
    fontSize: 17.5,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  chevronCircle: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    borderRadius: RADIUS.full,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    padding: 1.5,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.full,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 20, 19, 0.45)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 12.5,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: 4,
  },
  cityOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cityOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});