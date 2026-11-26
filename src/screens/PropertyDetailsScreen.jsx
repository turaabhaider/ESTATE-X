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

  const handleCallAgent = () => {
    if (property.agent?.phone) {
      Linking.openURL(`tel:${property.agent.phone}`).catch(() => {});
    }
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
                            onPress={() => setLoanYears(yr)}
                          >
                            <Text
                              style={[
                                styles.segmentText,
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
                        style={styles.stepperBtn}
                        onPress={() => adjustRate(-0.25)}
                      >
                        <Ionicons
                          name="remove"
                          size={16}
                          color={colors.textPrimary}
                        />
                      </TouchableOpacity>
                      <Text
                        style={[styles.rateValue, { color: colors.textPrimary }]}
                      >
                        {interestRate.toFixed(2)}%
                      </Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => adjustRate(0.25)}
                      >
                        <Ionicons
                          name="add"
                          size={16}
                          color={colors.textPrimary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Neighborhood & Coordinates */}
              <Text
                style={[styles.sectionHeading, { color: colors.textPrimary }]}
              >
                Neighborhood & Location
              </Text>
              <View style={styles.scoreGrid}>
                {neighborhoodScores.map((item) => (
                  <View
                    key={item.label}
                    style={[
                      styles.scoreCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.scoreValue, { color: colors.primary }]}
                    >
                      {item.score}
                    </Text>
                    <Text
                      style={[styles.scoreLabel, { color: colors.textPrimary }]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[styles.scoreTag, { color: colors.textMuted }]}
                    >
                      {item.tag}
                    </Text>
                  </View>
                ))}
              </View>

              <View
                style={[
                  styles.coordsCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="navigate-outline"
                  size={18}
                  color={colors.primary}
                />
                <View style={styles.coordsTextWrap}>
                  <Text
                    style={[styles.coordsTitle, { color: colors.textPrimary }]}
                  >
                    {property.location}
                  </Text>
                  <Text
                    style={[
                      styles.coordsDetail,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {property.address} · {property.coords.latitude.toFixed(4)},{' '}
                    {property.coords.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>

              {/* Nearby Transit & Essentials */}
              <Text
                style={[styles.sectionHeading, { color: colors.textPrimary }]}
              >
                Nearby Transit & Essentials
              </Text>
              <View style={styles.transitList}>
                {TRANSIT_ITEMS.map((t) => (
                  <View
                    key={t.id}
                    style={[
                      styles.transitRow,
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
                        name={t.icon}
                        size={17}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.transitInfo}>
                      <Text
                        style={[
                          styles.transitName,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {t.name}
                      </Text>
                      <Text
                        style={[
                          styles.transitDetail,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t.type} · {t.detail}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Listing Agent */}
              <Text
                style={[styles.sectionHeading, { color: colors.textPrimary }]}
              >
                Listing Advisor
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
                    {property.agent.role} · {property.agent.sales}
                  </Text>
                </View>
                <View style={styles.agentActions}>
                  <TouchableOpacity
                    style={[
                      styles.iconActionBtn,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleCallAgent}
                  >
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.iconActionBtn,
                      {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
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
                </View>
              </View>
            </>
          )}

          {/* TAB 2: GALLERY */}
          {activeTab === 'Gallery' && (
            <View style={styles.galleryTabGrid}>
              {property.images.map((uri, idx) => (
                <TouchableOpacity
                  key={`gal-${idx}`}
                  activeOpacity={0.9}
                  onPress={() => {
                    setActiveTab('About');
                    handleSelectThumbnail(idx);
                  }}
                >
                  <Image source={{ uri }} style={styles.galleryGridImg} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* TAB 3: REVIEW */}
          {activeTab === 'Review' && (
            <View style={styles.reviewsWrap}>
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
                          styles.reviewRole,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {rev.role} · {rev.date}
                      </Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={14} color={colors.gold} />
                      <Text
                        style={[
                          styles.ratingText,
                          { color: colors.textPrimary, fontWeight: '700' },
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

      {/* Bottom Sticky Price & Schedule Tour Bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <View>
          <Text style={[styles.bottomLabel, { color: colors.textSecondary }]}>
            Listing Price
          </Text>
          <Text style={[styles.bottomPrice, { color: colors.primary }]}>
            {property.priceFormatted}
            {property.period ? (
              <Text
                style={[styles.bottomPeriod, { color: colors.textSecondary }]}
              >
                {property.period}
              </Text>
            ) : null}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={() => setBookingModal(true)}
        >
          <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
          <Text style={styles.bookBtnText}>Schedule Tour</Text>
        </TouchableOpacity>
      </View>

      {/* Tour Booking Modal */}
      <Modal
        visible={bookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setBookingModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Schedule Private Tour
              </Text>
              <TouchableOpacity onPress={() => setBookingModal(false)}>
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              {property.title} with {property.agent.name}
            </Text>

            <Text style={[styles.modalSection, { color: colors.textPrimary }]}>
              Select Day
            </Text>
            <View style={styles.optionWrap}>
              {TOUR_DATES.map((d) => {
                const active = selectedDate === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: active
                          ? colors.primaryLight
                          : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedDate(d)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        {
                          color: active ? colors.primary : colors.textPrimary,
                        },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.modalSection, { color: colors.textPrimary }]}>
              Select Time
            </Text>
            <View style={styles.optionWrap}>
              {TOUR_TIMES.map((t) => {
                const active = selectedTime === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor: active
                          ? colors.primaryLight
                          : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedTime(t)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        {
                          color: active ? colors.primary : colors.textPrimary,
                        },
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
              <Text style={styles.confirmBtnText}>Confirm Viewing</Text>
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
    paddingBottom: 100,
  },
  galleryContainer: {
    position: 'relative',
    height: 320,
  },
  heroImage: {
    width,
    height: 320,
    resizeMode: 'cover',
  },
  topControls: {
    position: 'absolute',
    top: 44,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    gap: 8,
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...SHADOWS.subtle,
  },
  thumbDock: {
    position: 'absolute',
    bottom: 12,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 6,
  },
  thumbItem: {
    width: 46,
    height: 36,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbMoreBox: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  thumbMoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: SPACING.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  emeraldTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  emeraldTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  address: {
    fontSize: 13.5,
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  tabItem: {
    paddingVertical: 10,
    marginRight: 24,
  },
  tabLabel: {
    fontSize: 14,
  },
  metricsBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: SPACING.sm,
    marginBottom: 10,
  },
  description: {
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.sm,
  },
  amenityCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  amenityIconBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  calcCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    gap: 14,
  },
  calcTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcCaption: {
    fontSize: 12,
  },
  calcMonthly: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  calcMoSuffix: {
    fontSize: 13,
    fontWeight: '500',
  },
  aprPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  aprText: {
    fontSize: 12,
    fontWeight: '700',
  },
  calcGroup: {
    gap: 8,
  },
  calcLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  calcSubValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  dualControlRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dualCol: {
    flex: 1,
    gap: 8,
  },
  rateStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: 6,
    height: 36,
  },
  stepperBtn: {
    padding: 4,
  },
  rateValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  scoreCard: {
    flex: 1,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreTag: {
    fontSize: 11,
  },
  coordsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  coordsTextWrap: {
    flex: 1,
  },
  coordsTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  coordsDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  transitList: {
    gap: 8,
    marginBottom: SPACING.sm,
  },
  transitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  transitInfo: {
    flex: 1,
  },
  transitName: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  transitDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 12,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '700',
  },
  agentRole: {
    fontSize: 12,
    marginTop: 2,
  },
  agentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconActionBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  galleryTabGrid: {
    gap: 12,
  },
  galleryGridImg: {
    width: '100%',
    height: 210,
    borderRadius: RADIUS.md,
  },
  reviewsWrap: {
    gap: 12,
  },
  reviewCard: {
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewRole: {
    fontSize: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderTopWidth: 1,
    ...SHADOWS.medium,
  },
  bottomLabel: {
    fontSize: 11.5,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  bottomPeriod: {
    fontSize: 13,
    fontWeight: '500',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderTopWidth: 1,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 13,
  },
  modalSection: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  confirmBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});