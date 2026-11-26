import React, { useState, useMemo, useRef } from 'react';
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
  Share,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const DETAIL_TABS = ['About', 'Gallery', 'Review'];
const TOUR_DATES = ['Tomorrow', 'Sat, Nov 28', 'Sun, Nov 29', 'Mon, Nov 30'];
const TOUR_TIMES = ['10:00 AM', '1:30 PM', '4:00 PM', '6:00 PM'];
const DOWN_PAYMENT_OPTIONS = [10, 20, 30];
const TERM_YEARS_OPTIONS = [15, 20, 30];

const TRANSIT_ITEMS = [
  {
    id: 't1',
    icon: 'train-outline',
    type: 'Transit',
    name: 'Express Metro Hub',
    detail: '6 min walk · 0.3 mi',
  },
  {
    id: 't2',
    icon: 'restaurant-outline',
    type: 'Dining',
    name: 'Fine Dining & Cafes',
    detail: '4 min walk · 0.2 mi',
  },
  {
    id: 't3',
    icon: 'school-outline',
    type: 'Schools',
    name: 'Premier Academy',
    detail: '8 min drive · 2.1 mi',
  },
  {
    id: 't4',
    icon: 'leaf-outline',
    type: 'Parks',
    name: 'Botanical Reserve Trail',
    detail: '5 min walk · 0.25 mi',
  },
];

const CLIENT_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Claire Bennett',
    role: 'Private Buyer',
    rating: '5.0',
    date: '2 weeks ago',
    comment:
      'Exceptional natural light throughout the main living pavilion and seamless indoor-outdoor flow. The architectural finishes feel truly bespoke.',
  },
  {
    id: 'rev-2',
    author: 'Julian Mercer',
    role: 'Architect',
    rating: '4.9',
    date: '1 month ago',
    comment:
      'Quiet street presence, thoughtfully proportioned rooms, and effortless access to nearby dining and transit corridors.',
  },
];

export default function PropertyDetailsScreen({ route, navigation }) {
  const { property } = route.params;
  const {
    wishlist,
    toggleWishlist,
    compareList,
    toggleCompare,
    sendMessage,
    bookTour,
    colors,
  } = useApp();

  const galleryRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('About');
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(TOUR_DATES[0]);
  const [selectedTime, setSelectedTime] = useState(TOUR_TIMES[2]);

  // Mortgage Calculator State
  const [downPct, setDownPct] = useState(20);
  const [loanYears, setLoanYears] = useState(30);
  const [interestRate, setInterestRate] = useState(6.25);

  const isSaved = wishlist.includes(property.id);
  const isComparing = compareList.includes(property.id);

  // Deterministic neighborhood scores derived from property rating & category
  const neighborhoodScores = useMemo(() => {
    const boost = Math.round((property.rating - 4.8) * 100);
    const walkScore = Math.min(99, Math.max(72, 84 + boost));
    const transitScore = Math.min(
      98,
      Math.max(68, (property.category === 'Commercial' ? 92 : 79) + boost)
    );
    const lifestyleScore = Math.min(99, Math.max(76, 88 + boost));

    return [
      { label: 'Walk Score', score: walkScore, tag: 'Walkable' },
      { label: 'Transit', score: transitScore, tag: 'Connected' },
      { label: 'Lifestyle', score: lifestyleScore, tag: 'Prime' },
    ];
  }, [property.rating, property.category]);

  const basePrice =
    property.category === 'Rent' ? property.price * 12 : property.price;

  const mortgageStats = useMemo(() => {
    const downPayment = Math.round((basePrice * downPct) / 100);
    const principal = Math.max(basePrice - downPayment, 0);
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanYears * 12;

    let monthlyPayment = 0;
    if (principal > 0 && totalPayments > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = principal / totalPayments;
      } else {
        const factor = Math.pow(1 + monthlyRate, totalPayments);
        monthlyPayment = (principal * (monthlyRate * factor)) / (factor - 1);
      }
    }

    return {
      downPayment,
      principal,
      monthlyPayment: Math.round(monthlyPayment),
    };
  }, [basePrice, downPct, loanYears, interestRate]);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveSlide(index);
  };

  const handleSelectThumbnail = (idx) => {
    setActiveSlide(idx);
    galleryRef.current?.scrollTo({ x: idx * width, animated: true });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${property.title} — ${property.priceFormatted}${property.period} (${property.address})`,
      });
    } catch (_) {
      // Ignore dismissed share sheet
    }
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

  const adjustRate = (delta) => {
    setInterestRate((prev) =>
      Math.min(15, Math.max(1, Number((prev + delta).toFixed(2))))
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image Gallery Carousel with Floating Thumbnail Strip */}
        <View style={styles.galleryContainer}>
          <ScrollView
            ref={galleryRef}
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

          {/* Top Floating Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={[
                styles.roundBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={19}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.rightControls}>
              <TouchableOpacity
                style={[
                  styles.roundBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={handleShare}
              >
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roundBtn,
                  {
                    backgroundColor: isComparing ? colors.primary : colors.card,
                    borderColor: isComparing ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleCompare(property.id)}
              >
                <Ionicons
                  name="git-compare-outline"
                  size={18}
                  color={isComparing ? '#FFFFFF' : colors.textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roundBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => toggleWishlist(property.id)}
              >
                <Ionicons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={19}
                  color={isSaved ? colors.danger : colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Floating Photo Thumbnail Strip */}
          <View
            style={[
              styles.thumbDock,
              {
                backgroundColor: 'rgba(17, 20, 19, 0.72)',
                borderColor: 'rgba(255, 255, 255, 0.22)',
              },
            ]}
          >
            {property.images.map((uri, idx) => {
              const isSelected = activeSlide === idx;
              return (
                <TouchableOpacity
                  key={`thumb-${idx}`}
                  activeOpacity={0.85}
                  onPress={() => handleSelectThumbnail(idx)}
                  style={[
                    styles.thumbItem,
                    isSelected && {
                      borderColor: '#FFFFFF',
                      transform: [{ scale: 1.04 }],
                    },
                  ]}
                >
                  <Image source={{ uri }} style={styles.thumbImg} />
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveTab('Gallery')}
              style={styles.thumbMoreBox}
            >
              <Text style={styles.thumbMoreText}>
                +{Math.max(property.images.length, 4)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Body */}
        <View style={styles.body}>
          {/* Category Pill & Rating */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.emeraldTag,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Text style={[styles.emeraldTagText, { color: colors.primary }]}>
                {property.category}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={colors.gold} />
              <Text
                style={[styles.ratingText, { color: colors.textSecondary }]}
              >
                {property.rating} ({property.reviews} reviews)
              </Text>
            </View>
          </View>

          {/* Title & Address */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {property.title}
          </Text>
          <View style={styles.addressRow}>
            <Ionicons
              name="location-outline"
              size={15}
              color={colors.textSecondary}
            />
            <Text style={[styles.address, { color: colors.textSecondary }]}>
              {property.address}
            </Text>
          </View>

          {/* About / Gallery / Review Architectural Tabs */}
          <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
            {DETAIL_TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tabItem,
                    active && {
                      borderBottomColor: colors.primary,
                      borderBottomWidth: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: active ? colors.primary : colors.textSecondary,
                        fontWeight: active ? '700' : '600',
                      },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* TAB 1: ABOUT */}
          {activeTab === 'About' && (
            <>
              {/* Key Architectural Specs */}
              <View
                style={[
                  styles.metricsBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {property.beds > 0 && (
                  <View style={styles.metricItem}>
                    <Ionicons
                      name="bed-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.metricValue,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {property.beds} Beds
                    </Text>
                  </View>
                )}
                {property.baths > 0 && (
                  <View style={styles.metricItem}>
                    <Ionicons
                      name="water-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.metricValue,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {property.baths} Baths
                    </Text>
                  </View>
                )}
                <View style={styles.metricItem}>
                  <Ionicons
                    name="resize-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.metricValue, { color: colors.textPrimary }]}
                  >
                    {property.sqft.toLocaleString()} sqft
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text
                style={[styles.sectionHeading, { color: colors.textPrimary }]}
              >
                Description
              </Text>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {property.description}
              </Text>

              {/* Signature Amenities */}
              <Text
                style={[styles.sectionHeading, { color: colors.textPrimary }]}
              >
                Signature Amenities
              </Text>
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.amenityCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.amenityIconBox,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={17}
                        color={colors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.amenityLabel,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Interactive Mortgage & Payment Estimator */}
              <Text
                style={[styles.sectionHeading, { color: colors.textPrimary }]}
              >
                Mortgage & Payment Estimator
              </Text>
              <View
                style={[
                  styles.calcCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.calcTopRow}>
                  <View>
                    <Text
                      style={[
                        styles.calcCaption,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Estimated Monthly (P&I)
                    </Text>
                    <Text
                      style={[styles.calcMonthly, { color: colors.primary }]}
                    >
                      ${mortgageStats.monthlyPayment.toLocaleString()}
                      <Text
                        style={[
                          styles.calcMoSuffix,
                          { color: colors.textSecondary },
                        ]}
                      >
                        /mo
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.aprPill,
                      { backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <Ionicons
                      name="calculator-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={[styles.aprText, { color: colors.primary }]}>
                      {interestRate.toFixed(2)}% APR
                    </Text>
                  </View>
                </View>

                {/* Down Payment Selector */}
                <View style={styles.calcGroup}>
                  <View style={styles.calcLabelRow}>
                    <Text
                      style={[styles.calcLabel, { color: colors.textPrimary }]}
                    >
                      Down Payment ({downPct}%)
                    </Text>
                    <Text
                      style={[styles.calcSubValue, { color: colors.primary }]}
                    >
                      ${mortgageStats.downPayment.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.segmentRow}>
                    {DOWN_PAYMENT_OPTIONS.map((pct) => {
                      const active = downPct === pct;
                      return (
                        <TouchableOpacity
                          key={pct}
                          style={[
                            styles.segmentBtn,
                            {
                              backgroundColor: active
                                ? colors.primary
                                : colors.card,
                              borderColor: active
                                ? colors.primary
                                : colors.border,
                            },
                          ]}
                          onPress={() => setDownPct(pct)}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              {
                                color: active ? '#FFFFFF' : colors.textPrimary,
                              },
                            ]}
                          >
                            {pct}%
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Loan Term & Interest Rate */}
                <View style={styles.dualControlRow}>
                  <View style={styles.dualCol}>
                    <Text
                      style={[styles.calcLabel, { color: colors.textPrimary }]}
                    >
                      Loan Term
                    </Text>
                    <View style={styles.segmentRow}>
                      {TERM_YEARS_OPTIONS.map((yr) => {
                        const active = loanYears === yr;
                        return (
                          <TouchableOpacity
                            key={yr}
                            style={[
                              styles.smallSegmentBtn,
                              {
                                backgroundColor: active
                                  ? colors.primary
                                  : colors.card,
                                borderColor: active
                                  ? colors.primary
                                  : colors.border,
                              },
                            ]}
                            onPress={() => setLoanYears(yr)}
                          >
                            <Text
                              style={[
                                styles.smallSegmentText,
                                {
                                  color: active
                                    ? '#FFFFFF'
                                    : colors.textPrimary,
                                },
                              ]}
                            >
                              {yr}y
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.dualCol}>
                    <Text
                      style={[styles.calcLabel, { color: colors.textPrimary }]}
                    >
                      Interest Rate
                    </Text>
                    <View
                      style={[
                        styles.rateStepper,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.stepBtn,
                          { backgroundColor: colors.surface },
                        ]}
                        onPress={() => adjustRate(-0.25)}
                      >
                        <Ionicons
                          name="remove"
                          size={15}
                          color={colors.textPrimary}
                        />
                      </TouchableOpacity>
                      <Text
                        style={[
                          styles.rateValue,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {interestRate.toFixed(2)}%
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.stepBtn,
                          { backgroundColor: colors.surface },
                        ]}
                        onPress={() => adjustRate(0.25)}
                      >
                        <Ionicons
                          name="add"
                          size={15}
                          color={colors.textPrimary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.principalFooter,
                    { borderTopColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.principalLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Estimated Loan Principal
                  </Text>
                  <Text
                    style={[
                      styles.principalAmount,
                      { color: colors.textPrimary },
                    ]}
                  >
                    ${mortgageStats.principal.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Listing Agent Card */}
              <Text
                style={[styles.sectionHeading, { color: colors.textPrimary }]}
              >
                Listing Agent
              </Text>
              <View
                style={[
                  styles.agentCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Image
                  source={{ uri: property.agent.avatar }}
                  style={styles.agentAvatar}
                />
                <View style={styles.agentInfo}>
                  <Text
                    style={[styles.agentName, { color: colors.textPrimary }]}
                  >
                    {property.agent.name}
                  </Text>
                  <Text
                    style={[styles.agentRole, { color: colors.textSecondary }]}
                  >
                    {property.agent.role}
                  </Text>
                  <Text style={[styles.agentStats, { color: colors.primary }]}>
                    ★ {property.agent.rating} · {property.agent.sales}
                  </Text>
                </View>

                <View style={styles.agentActions}>
                  <TouchableOpacity
                    style={[
                      styles.agentIconBtn,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleMessageAgent}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.agentIconBtn,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      Linking.openURL(`tel:${property.agent.phone}`)
                    }
                  >
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Neighborhood Score & Nearby Transit */}
              <Text
                style={[styles.sectionHeading, { color: colors.textPrimary }]}
              >
                Neighborhood Score & Nearby Transit
              </Text>
              <View
                style={[
                  styles.neighborhoodCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.scoreRow}>
                  {neighborhoodScores.map((s) => (
                    <View
                      key={s.label}
                      style={[
                        styles.scoreBox,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.scoreNum, { color: colors.primary }]}
                      >
                        {s.score}
                      </Text>
                      <Text
                        style={[
                          styles.scoreLabel,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {s.label}
                      </Text>
                      <View
                        style={[
                          styles.scoreTag,
                          { backgroundColor: colors.primaryLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.scoreTagText,
                            { color: colors.primary },
                          ]}
                        >
                          {s.tag}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View
                  style={[
                    styles.transitDivider,
                    { backgroundColor: colors.border },
                  ]}
                />

                {TRANSIT_ITEMS.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.transitRow,
                      index < TRANSIT_ITEMS.length - 1 && [
                        styles.transitRowBorder,
                        { borderBottomColor: colors.border },
                      ],
                    ]}
                  >
                    <View
                      style={[
                        styles.transitIconBox,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={16}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.transitName,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.transitType,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.type}
                      </Text>
                    </View>
                    <Text
                      style={[styles.transitDetail, { color: colors.primary }]}
                    >
                      {item.detail}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Location Map */}
              <Text
                style={[styles.sectionHeading, { color: colors.textPrimary }]}
              >
                Location
              </Text>
              <View
                style={[styles.mapWrapper, { borderColor: colors.border }]}
              >
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
            </>
          )}

          {/* TAB 2: GALLERY */}
          {activeTab === 'Gallery' && (
            <View style={styles.galleryGrid}>
              {property.images.map((uri, idx) => (
                <TouchableOpacity
                  key={`gal-${idx}`}
                  activeOpacity={0.9}
                  onPress={() => handleSelectThumbnail(idx)}
                  style={[
                    styles.galleryGridCard,
                    { borderColor: colors.border },
                  ]}
                >
                  <Image source={{ uri }} style={styles.galleryGridImg} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* TAB 3: REVIEW */}
          {activeTab === 'Review' && (
            <View style={styles.reviewsList}>
              {CLIENT_REVIEWS.map((rev) => (
                <View
                  key={rev.id}
                  style={[
                    styles.reviewCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text
                        style={[
                          styles.reviewAuthor,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {rev.author}
                      </Text>
                      <Text
                        style={[
                          styles.reviewMeta,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {rev.role} · {rev.date}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.reviewScorePill,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Ionicons name="star" size={12} color={colors.gold} />
                      <Text
                        style={[
                          styles.reviewScoreText,
                          { color: colors.primary },
                        ]}
                      >
                        {rev.rating}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.reviewComment,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {rev.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Total Price & Book Now Bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <View>
          <Text style={[styles.priceCaption, { color: colors.textSecondary }]}>
            Total Price
          </Text>
          <Text style={[styles.bottomPrice, { color: colors.primary }]}>
            {property.priceFormatted}
            <Text
              style={[styles.bottomPeriod, { color: colors.textSecondary }]}
            >
              {property.period}
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.88}
          onPress={() => setBookingModal(true)}
        >
          <Text style={styles.ctaText}>Book Now</Text>
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
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Schedule Private Viewing
              </Text>
              <TouchableOpacity onPress={() => setBookingModal(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: colors.textPrimary }]}>
              Select Date
            </Text>
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
                    style={[
                      styles.slotPill,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedDate(d)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        { color: active ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.modalLabel, { color: colors.textPrimary }]}>
              Preferred Time
            </Text>
            <View style={styles.timeGrid}>
              {TOUR_TIMES.map((t) => {
                const active = selectedTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.slotPill,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedTime(t)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        { color: active ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
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
  },
  scrollContent: {
    paddingBottom: 112,
  },
  galleryContainer: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width,
    height: 320,
  },
  topControls: {
    position: 'absolute',
    top: 48,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightControls: {
    flexDirection: 'row',
    gap: 8,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.subtle,
  },
  thumbDock: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  thumbItem: {
    width: 46,
    height: 46,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbMoreBox: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbMoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  body: {
    padding: SPACING.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emeraldTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emeraldTagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.md,
  },
  address: {
    fontSize: 13.5,
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: SPACING.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
  },
  metricsBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metricValue: {
    fontSize: 13.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sectionHeading: {
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 10,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
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
    padding: 11,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  amenityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenityLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  calcCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  calcTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  calcCaption: {
    fontSize: 12,
    fontWeight: '600',
  },
  calcMonthly: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  calcMoSuffix: {
    fontSize: 13,
    fontWeight: '500',
  },
  aprPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  aprText: {
    fontSize: 11.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  calcGroup: {
    marginBottom: 14,
  },
  calcLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  calcLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  calcSubValue: {
    fontSize: 12.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  smallSegmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  smallSegmentText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dualControlRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  dualCol: {
    flex: 1,
  },
  rateStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: 6,
    height: 35,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateValue: {
    fontSize: 12.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  principalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  principalLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  principalAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
  },
  agentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  agentName: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  agentRole: {
    fontSize: 12,
    marginTop: 1,
  },
  agentStats: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  agentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  agentIconBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  neighborhoodCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scoreBox: {
    flex: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 11,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  scoreNum: {
    fontSize: 19,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scoreLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  scoreTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 5,
  },
  scoreTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  transitDivider: {
    height: 1,
    marginVertical: 14,
  },
  transitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 12,
  },
  transitRowBorder: {
    borderBottomWidth: 1,
  },
  transitIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transitName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  transitType: {
    fontSize: 11.5,
    marginTop: 1,
  },
  transitDetail: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  mapWrapper: {
    height: 165,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  miniMap: {
    flex: 1,
  },
  galleryGrid: {
    gap: 12,
  },
  galleryGridCard: {
    height: 200,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  galleryGridImg: {
    width: '100%',
    height: '100%',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  reviewMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  reviewScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  reviewScoreText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  reviewComment: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: 14,
    paddingBottom: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    ...SHADOWS.medium,
  },
  priceCaption: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  bottomPeriod: {
    fontSize: 12.5,
    fontWeight: '400',
  },
  ctaButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 20, 19, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 10,
  },
  slotPill: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  confirmBtn: {
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});