import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const TOUR_DATES = ['Tomorrow', 'Sat, Nov 28', 'Sun, Nov 29', 'Mon, Nov 30'];
const TOUR_TIMES = ['10:00 AM', '1:30 PM', '4:00 PM', '6:00 PM'];

export default function PropertyDetailsScreen({ route, navigation }) {
  const { property } = route.params;
  const {
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    sendMessage,
    bookTour,
  } = useApp();

  const [activeSlide, setActiveSlide] = useState(0);
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(TOUR_DATES[0]);
  const [selectedTime, setSelectedTime] = useState(TOUR_TIMES[2]);

  const isSaved = wishlist.includes(property.id);
  const isComparing = compareList.includes(property.id);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveSlide(index);
  };

  const handleConfirmTour = () => {
    bookTour(property, selectedDate, selectedTime);
    setBookingModal(false);
    Alert.alert(
      'Private Viewing Confirmed',
      `Your tour of ${property.title} with ${property.agent.name} is scheduled for ${selectedDate} at ${selectedTime}.`
    );
  };

  const handleMessageAgent = () => {
    sendMessage(
      property.agent.name,
      property.title,
      property.agent.avatar,
      `Hi ${property.agent.name}, I'm interested in ${property.title} (${property.priceFormatted}).`
    );
    navigation.navigate('MainTabs', { screen: 'Messages' });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Gallery Carousel */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {property.images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.heroImage} />
            ))}
          </ScrollView>

          {/* Floating Back & Action Buttons */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <View style={styles.rightControls}>
              <TouchableOpacity
                style={[
                  styles.roundBtn,
                  isComparing && { backgroundColor: COLORS.primary },
                ]}
                onPress={() => toggleCompare(property.id)}
              >
                <Ionicons
                  name="git-compare-outline"
                  size={19}
                  color={isComparing ? COLORS.white : COLORS.textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roundBtn}
                onPress={() => toggleWishlist(property.id)}
              >
                <Ionicons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isSaved ? COLORS.danger : COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pagination Dots */}
          <View style={styles.dotsRow}>
            {property.images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, activeSlide === i && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Main Content Body */}
        <View style={styles.body}>
          <View style={styles.badgeRow}>
            <View style={styles.emeraldTag}>
              <Text style={styles.emeraldTagText}>{property.category}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={COLORS.gold} />
              <Text style={styles.ratingText}>
                {property.rating} ({property.reviews} reviews)
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.address}>{property.address}</Text>
          </View>

          {/* Key Metrics Overview Box */}
          <View style={styles.metricsBox}>
            {property.beds > 0 && (
              <View style={styles.metricItem}>
                <Ionicons name="bed-outline" size={22} color={COLORS.primary} />
                <Text style={styles.metricValue}>{property.beds}</Text>
                <Text style={styles.metricLabel}>Bedrooms</Text>
              </View>
            )}
            {property.baths > 0 && (
              <View style={styles.metricItem}>
                <Ionicons name="water-outline" size={22} color={COLORS.primary} />
                <Text style={styles.metricValue}>{property.baths}</Text>
                <Text style={styles.metricLabel}>Bathrooms</Text>
              </View>
            )}
            <View style={styles.metricItem}>
              <Ionicons name="resize-outline" size={22} color={COLORS.primary} />
              <Text style={styles.metricValue}>
                {property.sqft.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>Sq Ft</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeading}>Architectural Overview</Text>
          <Text style={styles.description}>{property.description}</Text>

          {/* Amenities Grid */}
          <Text style={styles.sectionHeading}>Signature Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {property.amenities.map((item, idx) => (
              <View key={idx} style={styles.amenityCard}>
                <View style={styles.amenityIconBox}>
                  <Ionicons name={item.icon} size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.amenityLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Agent Profile Card */}
          <Text style={styles.sectionHeading}>Listing Advisor</Text>
          <View style={styles.agentCard}>
            <Image
              source={{ uri: property.agent.avatar }}
              style={styles.agentAvatar}
            />
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{property.agent.name}</Text>
              <Text style={styles.agentRole}>{property.agent.role}</Text>
              <Text style={styles.agentStats}>
                ★ {property.agent.rating} • {property.agent.sales}
              </Text>
            </View>

            <View style={styles.agentActions}>
              <TouchableOpacity
                style={styles.agentIconBtn}
                onPress={handleMessageAgent}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.agentIconBtn}
                onPress={() => Linking.openURL(`tel:${property.agent.phone}`)}
              >
                <Ionicons
                  name="call-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Map */}
          <Text style={styles.sectionHeading}>Neighborhood & Location</Text>
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.miniMap}
              initialRegion={{
                ...property.coords,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              scrollEnabled={false}
            >
              <Marker coordinate={property.coords} />
            </MapView>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Price & Schedule Tour CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceCaption}>Listing Price</Text>
          <Text style={styles.bottomPrice}>
            {property.priceFormatted}
            <Text style={styles.bottomPeriod}>{property.period}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.88}
          onPress={() => setBookingModal(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={COLORS.white} />
          <Text style={styles.ctaText}>Book Viewing</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule Viewing Modal */}
      <Modal
        visible={bookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Private Viewing</Text>
              <TouchableOpacity onPress={() => setBookingModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              {TOUR_DATES.map((d) => {
                const active = selectedDate === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[styles.slotPill, active && styles.slotPillActive]}
                    onPress={() => setSelectedDate(d)}
                  >
                    <Text
                      style={[styles.slotText, active && styles.slotTextActive]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.modalLabel}>Preferred Time</Text>
            <View style={styles.timeGrid}>
              {TOUR_TIMES.map((t) => {
                const active = selectedTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.slotPill, active && styles.slotPillActive]}
                    onPress={() => setSelectedTime(t)}
                  >
                    <Text
                      style={[styles.slotText, active && styles.slotTextActive]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmTour}
            >
              <Text style={styles.confirmBtnText}>Confirm Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  galleryContainer: {
    height: 340,
    position: 'relative',
  },
  heroImage: {
    width,
    height: 340,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightControls: {
    flexDirection: 'row',
    gap: 10,
  },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.white,
  },
  body: {
    padding: SPACING.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emeraldTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  emeraldTagText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: SPACING.lg,
  },
  address: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  metricsBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  description: {
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  amenityCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  amenityIconBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  agentAvatar: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
  },
  agentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  agentRole: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  agentStats: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 3,
  },
  agentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  agentIconBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapWrapper: {
    height: 170,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniMap: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: 14,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  priceCaption: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bottomPrice: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bottomPeriod: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20,23,26,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  slotPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    marginBottom: 10,
  },
  slotPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  slotTextActive: {
    color: COLORS.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});