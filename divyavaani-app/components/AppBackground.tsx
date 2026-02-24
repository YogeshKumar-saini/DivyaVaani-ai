import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const STAR_POINTS = [
  { top: '8%', left: '12%', size: 2, opacity: 0.8 },
  { top: '14%', left: '78%', size: 2, opacity: 0.6 },
  { top: '22%', left: '58%', size: 1, opacity: 0.7 },
  { top: '30%', left: '24%', size: 2, opacity: 0.65 },
  { top: '35%', left: '86%', size: 1, opacity: 0.55 },
  { top: '46%', left: '14%', size: 2, opacity: 0.7 },
  { top: '53%', left: '66%', size: 1, opacity: 0.65 },
  { top: '61%', left: '38%', size: 2, opacity: 0.6 },
  { top: '70%', left: '88%', size: 2, opacity: 0.7 },
  { top: '82%', left: '18%', size: 1, opacity: 0.6 },
  { top: '88%', left: '64%', size: 2, opacity: 0.7 },
];

interface AppBackgroundProps {
  children: React.ReactNode;
}

export function AppBackground({ children }: AppBackgroundProps) {
  return (
    // @ts-expect-error - React 19 + React Native type incompatibility
    <View style={styles.wrapper}>
      {/* @ts-expect-error - React 19 + React Native type incompatibility */}
      <View style={styles.layers} pointerEvents="none">
        {/* @ts-expect-error - React 19 + React Native type incompatibility */}
        <View style={styles.base} />

        <LinearGradient
          colors={['rgba(99,102,241,0.30)', 'rgba(236,72,153,0.18)', 'transparent']}
          start={{ x: 0.05, y: 0.05 }}
          end={{ x: 0.9, y: 0.6 }}
          style={[styles.orb, styles.orbTop]}
        />
        <LinearGradient
          colors={['rgba(249,115,22,0.20)', 'rgba(147,51,234,0.18)', 'transparent']}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.8, y: 1 }}
          style={[styles.orb, styles.orbMiddle]}
        />
        <LinearGradient
          colors={['rgba(6,182,212,0.18)', 'rgba(99,102,241,0.12)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.bottomGlow}
        />

        {STAR_POINTS.map((star, index) => (
          // @ts-expect-error - React 19 + React Native type incompatibility
          <View
            key={`${star.top}-${star.left}-${index}`}
            style={[
              styles.star,
              {
                top: star.top as `${number}%`,
                left: star.left as `${number}%`,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              },
            ]}
          />
        ))}

        {/* @ts-expect-error - React 19 + React Native type incompatibility */}
        <View style={styles.vignette} />
      </View>

      {/* @ts-expect-error - React 19 + React Native type incompatibility */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#03020c',
  },
  layers: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#03020c',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbTop: {
    width: 520,
    height: 520,
    top: -180,
    left: -120,
  },
  orbMiddle: {
    width: 620,
    height: 620,
    top: '28%',
    right: -220,
  },
  bottomGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -60,
    height: 320,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 999,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  content: {
    flex: 1,
  },
});
