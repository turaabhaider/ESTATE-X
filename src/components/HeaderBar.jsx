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
  const { selectedCity, setSelectedCity, compareList, colors } = useApp();
  const [cityModalVisible, setCityModalVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View>
        <Text style={[styles.locationCaption, { color: colors.textMuted }]}>
          Location
        </Text>
        <TouchableOpacity
          style={styles.locationRow}
          activeOpacity={0.75}
          onPress={() => setCityModalVisible(true)}
        >
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={[styles.cityText, { color: colors.textPrimary }]}>
            {selectedCity}
          </Text>
          <Ionicons
            name="chevron-down"
            size={15}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
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
              size={18}
              color={colors.primary}
            />
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{compareList.length}</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.iconBtn,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons
            name="notifications-outline"
            size={19}
            color={colors.textPrimary}
          />
          <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />
        </TouchableOpacity>

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
        </TouchableOpacity>
      </View>

      {/* City Selector Modal */}
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
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Select Market
            </Text>
            <FlatList
              data={CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const active = item === selectedCity;
                return (
                  <TouchableOpacity
                    style={[
                      styles.cityOption,
                      active && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => {
                      setSelectedCity(item);
                      setCityModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.cityOptionText,
                        { color: colors.textPrimary },
                        active && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {item}
                    </Text>
                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={18}
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
  locationCaption: {
    fontSize: 11.5,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cityText: {
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.3,
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
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    padding: 1.5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.full,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 20, 19, 0.4)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.md,
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
  cityOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});