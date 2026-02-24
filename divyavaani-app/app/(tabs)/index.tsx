import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { AppBackground } from '@/components/AppBackground';
import { Colors, Gradients, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { SUGGESTED_QUESTIONS } from '@/constants/config';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
            <Text style={styles.greetingText}>{greeting}, Seeker</Text>
            <Text style={styles.subGreetingText}>What guidance do you seek today?</Text>
          </Animated.View>

          {/* Hero Section */}
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
            <LinearGradient colors={Gradients.primaryToAccent} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.heroContent}>
                <View>
                  <Text style={styles.heroTitle}>DivyaVaani</Text>
                  <Text style={styles.heroSubtitle}>Universal Spiritual Guidance</Text>
                </View>
                <Ionicons name="sparkles" size={48} color="rgba(255,255,255,0.2)" style={styles.heroIcon} />
              </View>
              <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/(tabs)/chat')}>
                <Text style={styles.heroButtonText}>Start Asking</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.textInverse} />
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Explore Section */}
          <Animated.View entering={FadeInDown.delay(400).duration(600).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explore</Text>
              <Ionicons name="compass-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.featureGrid}>
              <FeatureCard icon="chatbubble-ellipses-outline" title="Chat" subtitle="Ask spiritual questions" route="/(tabs)/chat" delay={500} />
              <FeatureCard icon="time-outline" title="History" subtitle="Revisit old conversations" route="/(tabs)/history" delay={600} />
              <FeatureCard icon="sparkles-outline" title="Wisdom" subtitle="Contextual scripture answers" route="/(tabs)/chat" delay={700} />
              <FeatureCard icon="person-outline" title="Profile" subtitle="Manage account settings" route="/(tabs)/profile" delay={800} />
            </View>
          </Animated.View>

          {/* Suggested Questions Section */}
          <Animated.View entering={FadeInDown.delay(600).duration(600).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Suggested Questions</Text>
              <Ionicons name="help-circle-outline" size={20} color={Colors.accent} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsContainer}
              snapToInterval={width * 0.75 + Spacing.md}
              decelerationRate="fast"
            >
              {SUGGESTED_QUESTIONS.map((item, index) => (
                <TouchableOpacity
                  key={`${item.tag}-${index}`}
                  style={styles.suggestionCard}
                  onPress={() => router.push({ pathname: '/(tabs)/chat', params: { q: item.text } })}
                >
                  <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.01)']} style={styles.suggestionGradient} />
                  <Ionicons name="chatbubble-outline" size={22} color={Colors.primary} style={styles.suggestionIcon} />
                  <Text style={styles.suggestionText}>{item.text}</Text>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{item.tag}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  route: string;
  delay: number;
}

function FeatureCard({ icon, title, subtitle, route, delay }: FeatureCardProps) {
  return (
    <Animated.View entering={FadeIn.delay(delay).duration(500)} style={styles.featureCardWrapper}>
      <TouchableOpacity
        style={styles.featureCard}
        onPress={() => router.push(route as any)}
        activeOpacity={0.7}
      >
        <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.0)']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.featureIconWrap}>
          <Ionicons name={icon} size={22} color={Colors.primary} />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xxl,
  },
  header: {
    paddingHorizontal: Spacing.xl,
  },
  greetingText: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subGreetingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  heroCard: {
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    ...Shadows.lg,
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    ...Typography.h1,
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  heroIcon: {
    position: 'absolute',
    right: -10,
    top: -10,
    transform: [{ rotate: '15deg' }],
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  heroButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  featureCardWrapper: {
    width: '47.5%',
  },
  featureCard: {
    height: 140,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  featureTitle: {
    ...Typography.label,
    fontSize: 16,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  featureSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  suggestionsContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  suggestionCard: {
    width: width * 0.75,
    height: 160,
    backgroundColor: Colors.glass,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  suggestionGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  suggestionIcon: {
    marginBottom: Spacing.sm,
  },
  suggestionText: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    lineHeight: 24,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  tagText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '600',
  },
});
