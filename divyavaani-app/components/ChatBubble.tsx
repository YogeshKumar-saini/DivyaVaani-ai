/**
 * ChatBubble — styled message bubble for user/assistant
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatBubbleProps {
    role: 'user' | 'bot';
    content: string;
    timestamp?: Date;
    isStreaming?: boolean;
}

export function ChatBubble({ role, content, timestamp, isStreaming }: ChatBubbleProps) {
    const isUser = role === 'user';

    return (
        <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
            {/* Avatar */}
            {!isUser && (
                <View style={[styles.avatarWrap]}>
                    <LinearGradient
                        colors={['rgba(139, 92, 246, 0.2)', 'rgba(56, 189, 248, 0.1)']}
                        style={styles.avatarGradient}
                    >
                        <Ionicons name="sparkles" size={14} color={Colors.primary} />
                    </LinearGradient>
                </View>
            )}

            {isUser ? (
                <View style={styles.userBubbleWrap}>
                    <LinearGradient
                        colors={['#7C3AED', '#4F46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.userBubble}
                    >
                        <Text style={styles.userText}>{content}</Text>
                        {timestamp && (
                            <Text style={styles.userTime}>
                                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        )}
                    </LinearGradient>
                </View>
            ) : (
                <View style={styles.botBubble}>
                    <Markdown style={markdownStyles}>{content || ' '}</Markdown>

                    {isStreaming && (
                        <View style={styles.cursorContainer}>
                            <View style={styles.cursor} />
                        </View>
                    )}

                    {timestamp && (
                        <Text style={styles.botTime}>
                            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    )}
                </View>
            )}

            {isUser && (
                <View style={[styles.avatarWrap, { marginLeft: Spacing.sm }]}>
                    <View style={styles.userAvatar}>
                        <Ionicons name="person" size={14} color="#F8FAFC" />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        alignItems: 'flex-end',
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    botContainer: {
        justifyContent: 'flex-start',
    },
    avatarWrap: {
        marginBottom: 2,
    },
    avatarGradient: {
        width: 28,
        height: 28,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    userAvatar: {
        width: 28,
        height: 28,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    userBubbleWrap: {
        maxWidth: '78%',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    userBubble: {
        borderRadius: Radius.xl,
        borderBottomRightRadius: 4,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md - 2,
    },
    botBubble: {
        maxWidth: '82%',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: Radius.xl,
        borderBottomLeftRadius: 4,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    userText: {
        ...Typography.body,
        color: '#FFFFFF',
        lineHeight: 22,
    },
    userTime: {
        ...Typography.caption,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'right',
        marginTop: 4,
        fontSize: 10,
    },
    botTime: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginTop: 6,
        fontSize: 10,
    },
    cursorContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    cursor: {
        width: 3,
        height: 16,
        backgroundColor: '#8B5CF6',
        borderRadius: 2,
        opacity: 0.8,
    },
});

const markdownStyles = StyleSheet.create({
    body: {
        color: Colors.text,
        fontSize: 15,
        lineHeight: 24,
    },
    heading1: {
        color: Colors.text,
        fontSize: 22,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    heading2: {
        color: Colors.text,
        fontSize: 19,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 6,
        letterSpacing: -0.2,
    },
    heading3: {
        color: Colors.text,
        fontSize: 17,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4,
    },
    paragraph: {
        marginTop: 0,
        marginBottom: 10,
    },
    strong: {
        color: '#E2E8F0',
        fontWeight: '700',
    },
    em: {
        color: Colors.primaryLight,
        fontStyle: 'italic',
    },
    bullet_list: {
        marginVertical: 6,
    },
    ordered_list: {
        marginVertical: 6,
    },
    list_item: {
        marginVertical: 2,
        lineHeight: 22,
    },
    code_inline: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        color: '#C4B5FD',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 13,
        fontFamily: 'monospace',
    },
    fence: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 10,
        padding: 12,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    code_block: {
        color: '#C4B5FD',
        fontSize: 13,
        fontFamily: 'monospace',
    },
    blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: '#8B5CF6',
        paddingLeft: 12,
        marginVertical: 10,
        opacity: 0.9,
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        paddingVertical: 8,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    link: {
        color: '#A78BFA',
        textDecorationLine: 'underline',
    },
    hr: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        height: 1,
        marginVertical: 14,
    },
});
