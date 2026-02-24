import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Radius, Shadows, Typography, Gradients } from '@/constants/theme';
import { handleAPIError } from '@/services/api-client';
import { AppBackground } from '@/components/AppBackground';

export default function RegisterScreen() {
    const { register, googleLogin } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Email and password are required');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await register(email.trim(), password, fullName.trim() || undefined);
            router.push({
                pathname: '/(auth)/verify-email',
                params: { email: email.trim() },
            });
        } catch (err) {
            setError(handleAPIError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            if (googleLogin) {
                await googleLogin();
                router.replace('/(tabs)');
            } else {
                Alert.alert('Coming Soon', 'Google Authentication is being set up!');
            }
        } catch (err) {
            setError(handleAPIError(err));
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <AppBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Brand */}
                    <View style={styles.brandSection}>
                        <View style={styles.logoContainer}>
                            <LinearGradient colors={Gradients.primary} style={styles.logoGradient}>
                                <Ionicons name="sparkles" size={28} color="#fff" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.brandTitle}>Create Account</Text>
                        <Text style={styles.brandSubtitle}>Begin your spiritual journey</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        {error ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Social Login */}
                        <TouchableOpacity
                            onPress={handleGoogleRegister}
                            disabled={googleLoading || loading}
                            style={styles.socialButton}
                            activeOpacity={0.7}
                        >
                            {googleLoading ? (
                                <ActivityIndicator color={Colors.text} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="logo-google" size={20} color={Colors.text} />
                                    <Text style={styles.socialButtonText}>Sign up with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or email</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Full Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Your name (optional)"
                                    placeholderTextColor={Colors.textMuted}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    autoCapitalize="words"
                                    editable={!loading && !googleLoading}
                                />
                            </View>
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@example.com"
                                    placeholderTextColor={Colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    editable={!loading && !googleLoading}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Min 6 characters"
                                    placeholderTextColor={Colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!loading && !googleLoading}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Repeat password"
                                    placeholderTextColor={Colors.textMuted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!loading && !googleLoading}
                                />
                            </View>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity onPress={handleRegister} disabled={loading || googleLoading} activeOpacity={0.8}>
                            <LinearGradient
                                colors={Gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.registerButton}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.registerButtonText}>Create Account</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </AppBackground>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxxl,
    },
    brandSection: { alignItems: 'center', marginBottom: Spacing.xxl },
    logoContainer: { marginBottom: Spacing.md },
    logoGradient: {
        width: 56,
        height: 56,
        borderRadius: Radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.glow,
    },
    brandTitle: { ...Typography.h2, color: '#fff', marginBottom: Spacing.xs },
    brandSubtitle: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.7)' },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: Radius.xxl,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.xl,
        ...Shadows.lg,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    errorText: { ...Typography.bodySmall, color: Colors.error, flex: 1 },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: Radius.md,
        paddingVertical: 14,
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    socialButtonText: {
        ...Typography.button,
        color: Colors.text,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        ...Typography.caption,
        color: Colors.textMuted,
        paddingHorizontal: Spacing.md,
    },
    inputGroup: { marginBottom: Spacing.lg },
    label: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        paddingHorizontal: Spacing.md,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: {
        flex: 1,
        color: Colors.text,
        ...Typography.body,
        paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    },
    passwordInput: { paddingRight: 40 },
    eyeButton: { position: 'absolute', right: Spacing.md, padding: Spacing.xs },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Radius.md,
        paddingVertical: 14,
        gap: Spacing.sm,
        marginTop: Spacing.sm,
        ...Shadows.glow,
    },
    registerButtonText: { ...Typography.button, color: '#fff' },
    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
    loginText: { ...Typography.bodySmall, color: Colors.textSecondary },
    loginLink: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '600' },
});
