/**
 * History Screen — list of past conversations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TextInput,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { conversationService, Conversation } from '@/services/conversation-service';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export default function HistoryScreen() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadConversations = useCallback(async () => {
        if (!user) return;
        try {
            const data = await conversationService.getConversations(user.id);
            setConversations(data);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadConversations();
    }, [loadConversations]);

    const handleDelete = (id: string) => {
        Alert.alert('Delete Conversation', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await conversationService.deleteConversation(id);
                        setConversations((prev) => prev.filter((c) => c.id !== id));
                    } catch { }
                },
            },
        ]);
    };

    const filteredConversations = searchQuery.trim()
        ? conversations.filter(
            (c) =>
                c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
        )
        : conversations;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
                // Navigate to chat with this conversation
                router.push({
                    pathname: '/(tabs)/chat',
                    params: { conversationId: item.id },
                });
            }}
            onLongPress={() => handleDelete(item.id)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                    <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title || 'Untitled Conversation'}
                    </Text>
                    <Text style={styles.cardMeta}>
                        {formatDate(item.updated_at)} · {item.total_messages} messages
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
            </View>

            {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsRow}>
                    {item.tags.slice(0, 3).map((tag, idx) => (
                        <View key={idx} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Conversations</Text>
                    <Text style={styles.headerSubtitle}>
                        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                    </Text>
                </View>

                {/* Search */}
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={16} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search conversations..."
                        placeholderTextColor={Colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* List */}
                {filteredConversations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? 'No results' : 'No conversations yet'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Start chatting to see your history here'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredConversations}
                        renderItem={renderConversation}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={Colors.primary}
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    container: { flex: 1 },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerTitle: { ...Typography.h2, color: Colors.text },
    headerSubtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },

    // Search
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: Colors.text,
        ...Typography.bodySmall,
        paddingVertical: 10,
    },

    // List
    listContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
    card: {
        backgroundColor: Colors.glass,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    cardIcon: {
        width: 36,
        height: 36,
        borderRadius: Radius.md,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: { flex: 1 },
    cardTitle: { ...Typography.body, color: Colors.text, fontWeight: '600' },
    cardMeta: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginTop: Spacing.sm,
        paddingLeft: 48,
    },
    tag: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },
    tagText: { ...Typography.caption, color: Colors.accent, fontSize: 10 },

    // Empty
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxxl,
    },
    emptyTitle: { ...Typography.h3, color: Colors.textSecondary, marginTop: Spacing.lg },
    emptySubtitle: {
        ...Typography.bodySmall,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: Spacing.xs,
    },
});
