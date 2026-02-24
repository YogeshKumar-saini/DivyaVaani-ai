/**
 * Profile Screen — user profile, settings, logout
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth-service';
import { handleAPIError } from '@/services/api-client';
import { Colors, Spacing, Radius, Typography, Shadows, Gradients } from '@/constants/theme';

export default function ProfileScreen() {
    const { user, logout, refreshUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(user?.full_name || '');
    const [saving, setSaving] = useState(false);

    // Change Password state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const handleSaveName = async () => {
        if (!editName.trim()) return;
        setSaving(true);
        try {
            await authService.updateProfile({ full_name: editName.trim() });
            await refreshUser();
            setEditing(false);
        } catch (err) {
            Alert.alert('Error', handleAPIError(err));
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            Alert.alert('Error', 'Please fill in both fields');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }
        setChangingPassword(true);
        try {
            await authService.updatePassword({ old_password: oldPassword, new_password: newPassword });
            Alert.alert('Success', 'Password changed successfully');
            setShowPasswordForm(false);
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            Alert.alert('Error', handleAPIError(err));
        } finally {
            setChangingPassword(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: logout,
            },
        ]);
    };

    const initials = (user?.full_name || user?.email || '?')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {/* Avatar Card */}
                <View style={styles.avatarCard}>
                    <LinearGradient colors={Gradients.primary} style={styles.avatarGradient}>
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarInitials}>{initials}</Text>
                        )}
                    </LinearGradient>

                    {editing ? (
                        <View style={styles.editRow}>
                            <TextInput
                                style={styles.editInput}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Your name"
                                placeholderTextColor={Colors.textMuted}
                                autoFocus
                            />
                            <TouchableOpacity onPress={handleSaveName} disabled={saving} style={styles.saveButton}>
                                {saving ? (
                                    <ActivityIndicator size="small" color={Colors.primary} />
                                ) : (
                                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelButton}>
                                <Ionicons name="close" size={20} color={Colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => { setEditName(user?.full_name || ''); setEditing(true); }}>
                            <Text style={styles.userName}>{user?.full_name || 'Set your name'}</Text>
                            <Ionicons name="pencil-outline" size={14} color={Colors.textMuted} style={styles.editIcon} />
                        </TouchableOpacity>
                    )}

                    <Text style={styles.userEmail}>{user?.email}</Text>

                    <View style={styles.roleBadge}>
                        <Ionicons name="shield-checkmark" size={12} color={Colors.success} />
                        <Text style={styles.roleText}>{user?.role || 'user'}</Text>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    {/* Change Password */}
                    <TouchableOpacity
                        style={styles.settingsItem}
                        onPress={() => setShowPasswordForm(!showPasswordForm)}
                    >
                        <View style={styles.settingsIcon}>
                            <Ionicons name="key-outline" size={18} color={Colors.accent} />
                        </View>
                        <Text style={styles.settingsLabel}>Change Password</Text>
                        <Ionicons
                            name={showPasswordForm ? 'chevron-up' : 'chevron-forward'}
                            size={16}
                            color={Colors.textMuted}
                        />
                    </TouchableOpacity>

                    {showPasswordForm && (
                        <View style={styles.passwordForm}>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Current password"
                                placeholderTextColor={Colors.textMuted}
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                secureTextEntry
                            />
                            <TextInput
                                style={styles.formInput}
                                placeholder="New password (min 6 chars)"
                                placeholderTextColor={Colors.textMuted}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                            <TouchableOpacity onPress={handleChangePassword} disabled={changingPassword}>
                                <LinearGradient colors={Gradients.primary} style={styles.changePasswordButton}>
                                    {changingPassword ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.changePasswordText}>Update Password</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>

                    <View style={styles.aboutCard}>
                        <View style={styles.aboutRow}>
                            <Text style={styles.aboutLabel}>App</Text>
                            <Text style={styles.aboutValue}>DivyaVaani v1.0.0</Text>
                        </View>
                        <View style={styles.aboutDivider} />
                        <View style={styles.aboutRow}>
                            <Text style={styles.aboutLabel}>Platform</Text>
                            <Text style={styles.aboutValue}>React Native + Expo</Text>
                        </View>
                        <View style={styles.aboutDivider} />
                        <View style={styles.aboutRow}>
                            <Text style={styles.aboutLabel}>Powered by</Text>
                            <Text style={styles.aboutValue}>Llama 3.1 + RAG</Text>
                        </View>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <View style={{ height: Spacing.xxxl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { paddingBottom: Spacing.xxxl },
    header: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerTitle: { ...Typography.h2, color: Colors.text },

    // Avatar Card
    avatarCard: {
        alignItems: 'center',
        backgroundColor: Colors.glass,
        marginHorizontal: Spacing.xl,
        borderRadius: Radius.xxl,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
        ...Shadows.lg,
    },
    avatarGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        ...Shadows.glow,
    },
    avatarImage: {
        width: 76,
        height: 76,
        borderRadius: 38,
    },
    avatarInitials: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
    },
    userName: {
        ...Typography.h3,
        color: Colors.text,
        textAlign: 'center',
    },
    editIcon: {
        position: 'absolute',
        right: -20,
        top: 4,
    },
    userEmail: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        marginTop: 2,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: Radius.full,
        gap: 4,
        marginTop: Spacing.sm,
    },
    roleText: {
        ...Typography.caption,
        color: Colors.success,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    editInput: {
        flex: 1,
        backgroundColor: Colors.inputBackground,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        color: Colors.text,
        ...Typography.body,
    },
    saveButton: { padding: Spacing.xs },
    cancelButton: { padding: Spacing.xs },

    // Section
    section: {
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        ...Typography.label,
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.md,
    },

    // Settings
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.glass,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    settingsIcon: {
        width: 36,
        height: 36,
        borderRadius: Radius.md,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsLabel: {
        ...Typography.body,
        color: Colors.text,
        flex: 1,
    },
    passwordForm: {
        backgroundColor: Colors.glass,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderTopWidth: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    formInput: {
        backgroundColor: Colors.inputBackground,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
        color: Colors.text,
        ...Typography.body,
    },
    changePasswordButton: {
        borderRadius: Radius.md,
        paddingVertical: 12,
        alignItems: 'center',
    },
    changePasswordText: {
        ...Typography.button,
        color: '#fff',
    },

    // About
    aboutCard: {
        backgroundColor: Colors.glass,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.lg,
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
    },
    aboutLabel: { ...Typography.bodySmall, color: Colors.textMuted },
    aboutValue: { ...Typography.bodySmall, color: Colors.text, fontWeight: '500' },
    aboutDivider: { height: 1, backgroundColor: Colors.border },

    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.xl,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        paddingVertical: 14,
        gap: Spacing.sm,
    },
    logoutText: {
        ...Typography.button,
        color: Colors.error,
    },
});
