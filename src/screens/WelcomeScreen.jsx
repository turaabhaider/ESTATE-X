import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

const { height } = Dimensions.get('window');

const PRIMARY_HERO_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

const FALLBACK_HERO_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';

export default function WelcomeScreen({ navigation }) {
  const { colors } = useApp();
  const [heroUri, setHeroUri] = useState(PRIMARY_HERO_IMAGE);

  const handleGetStarted = () => {
    navigation.replace('MainTabs');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={{ uri: heroUri }}
        onError={() => {
          if (heroUri !== FALLBACK_HERO_IMAGE) {
            setHeroUri(FALLBACK_HERO_IMAGE);
          }
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(17, 20, 19, 0.45)',
            'rgba(17, 20, 19, 0.25)',
            'rgba(13, 18, 16, 0.92)',
          ]}
          locations={[0, 0.45, 1]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* Top Brand Mark */}
            <View style={styles.topRow}>
              <View style={styles.brandBadge}>
                <View
                  style={[styles.brandDot, { backgroundColor: colors.primary }]}
                />
                <Text style={styles.brandText}>ESTATEX PRIVATE</Text>
              </View>
            </View>

            {/* Bottom Editorial Headline & Get Started CTA */}
            <View style={styles.bottomBlock}>
              <Text style={styles.headline}>
                Find the place{'\n'}you&apos;ll love
              </Text>

              <Text style={styles.subheadline}>
                Browse, compare, and explore architectural homes, penthouses,
                and private estates—no account required.
              </Text>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleGetStarted}
                style={[styles.ctaButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.ctaText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: height,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(17, 20, 19, 0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  bottomBlock: {
    paddingBottom: SPACING.sm,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 46,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  subheadline: {
    color: '#D8DEDB',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.lg,
    maxWidth: '95%',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: RADIUS.md,
    ...SHADOWS.medium,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});