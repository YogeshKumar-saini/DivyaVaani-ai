/**
 * SourceCard — shows Gita verse references from RAG context
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

interface SourceCardProps {
    verse: string;
    text: string;
    score: number;
    sanskrit?: string;
    translation?: string;
    chapter?: string;
}

export function SourceCard({ verse, text, score, sanskrit, translation, chapter }: SourceCardProps) {
    const [expanded, setExpanded] = useState(false);
    const scorePercent = Math.round(score * 100);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setExpanded(!expanded)}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.verseTag}>
                    <Ionicons name="book-outline" size={12} color={Colors.accent} />
                    <Text style={styles.verseText} numberOfLines={1}>
                        {verse}
                    </Text>
                </View>
                <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{scorePercent}%</Text>
                </View>
            </View>

            {chapter && (
                <Text style={styles.chapter}>Chapter {chapter}</Text>
            )}

            <Text style={styles.snippetText} numberOfLines={expanded ? undefined : 2}>
                {text}
            </Text>

            {expanded && sanskrit && (
                <View style={styles.expandedBlock}>
                    <Text style={styles.blockLabel}>Sanskrit</Text>
                    <Text style={styles.sanskritText}>{sanskrit}</Text>
                </View>
            )}

            {expanded && translation && (
                <View style={styles.expandedBlock}>
                    <Text style={styles.blockLabel}>Translation</Text>
                    <Text style={styles.translationText}>{translation}</Text>
                </View>
            )}

            <View style={styles.expandRow}>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={Colors.textMuted}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
        padding: Spacing.lg,
        marginTop: Spacing.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    verseTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        paddingHorizontal: Spacing.sm + 2,
        paddingVertical: 4,
        borderRadius: Radius.md,
        gap: 6,
        maxWidth: '78%',
        flexShrink: 1,
    },
    verseText: {
        ...Typography.caption,
        color: '#C4B5FD',
        fontWeight: '700',
        flexShrink: 1,
    },
    scoreBadge: {
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        paddingHorizontal: Spacing.sm + 2,
        paddingVertical: 3,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: 'rgba(14, 165, 233, 0.3)',
    },
    scoreText: {
        ...Typography.caption,
        color: '#7DD3FC',
        fontWeight: '700',
    },
    chapter: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginBottom: Spacing.sm,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    snippetText: {
        ...Typography.bodySmall,
        color: '#E2E8F0',
        lineHeight: 22,
    },
    expandedBlock: {
        marginTop: Spacing.lg,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    blockLabel: {
        ...Typography.caption,
        color: '#94A3B8',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    sanskritText: {
        ...Typography.bodySmall,
        color: '#67E8F9',
        fontStyle: 'italic',
        lineHeight: 22,
    },
    translationText: {
        ...Typography.bodySmall,
        color: '#E2E8F0',
        lineHeight: 24,
    },
    expandRow: {
        alignItems: 'center',
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.03)',
    },
});
