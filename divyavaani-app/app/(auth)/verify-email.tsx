import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppBackground } from '@/components/AppBackground';
import { Colors, Spacing, Radius, Shadows, Typography, Gradients } from '@/constants/theme';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <AppBackground>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <LinearGradient colors={Gradients.primary} style={styles.iconCircle}>
              <Ionicons name="mail-open-outline" size={28} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            Account created successfully for {email || 'your email'}.
          </Text>
          <Text style={styles.note}>
            If you expected an OTP screen: current backend auth flow does not expose an OTP verify endpoint for mobile yet.
          </Text>

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.8}
            style={styles.buttonWrap}
          >
            <LinearGradient colors={Gradients.primary} style={styles.button}>
              <Text style={styles.buttonText}>Go To Sign In</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  title: {
    ...Typography.h2,
    color: '#fff',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  note: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  buttonWrap: {
    marginTop: Spacing.sm,
  },
  button: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  buttonText: {
    ...Typography.button,
    color: '#fff',
  },
});
