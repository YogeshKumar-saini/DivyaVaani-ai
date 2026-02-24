import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Conversation } from '@/services/conversation-service';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';

interface ChatSidebarProps {
  visible: boolean;
  isLoggedIn: boolean;
  loading: boolean;
  conversations: Conversation[];
  currentConversationId?: string;
  onClose: () => void;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => Promise<void>;
  onRefresh: () => void;
}

type Row =
  | { type: 'header'; key: string; label: string }
  | { type: 'item'; key: string; conversation: Conversation };

function getGroupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'Previous 7 Days';
  return 'Older';
}

function formatMetaDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ChatSidebar({
  visible,
  isLoggedIn,
  loading,
  conversations,
  currentConversationId,
  onClose,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRefresh,
}: ChatSidebarProps) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) setSearch('');
  }, [visible]);

  const rows: Row[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? conversations.filter(
        (c) =>
          (c.title || 'New Conversation').toLowerCase().includes(q) ||
          c.tags?.some((tag) => tag.toLowerCase().includes(q)),
      )
      : conversations;

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

    const grouped: Record<string, Conversation[]> = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    sorted.forEach((conversation) => {
      grouped[getGroupLabel(conversation.updated_at)].push(conversation);
    });

    const out: Row[] = [];
    (['Today', 'Yesterday', 'Previous 7 Days', 'Older'] as const).forEach((group) => {
      if (grouped[group].length === 0) return;
      out.push({ type: 'header', key: `h-${group}`, label: group });
      grouped[group].forEach((conversation) => {
        out.push({
          type: 'item',
          key: `c-${conversation.id}`,
          conversation,
        });
      });
    });

    return out;
  }, [conversations, search]);

  const requestDelete = (id: string) => {
    Alert.alert('Delete conversation?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await onDeleteConversation(id);
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.omBadge}>
                <Text style={styles.omText}>ॐ</Text>
              </View>
              <Text style={styles.headerTitle}>Conversations</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={18} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => {
              onNewChat();
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={17} color="#fff" />
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={14} color={Colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search conversations..."
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {!isLoggedIn ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="person-circle-outline" size={34} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Login Required</Text>
              <Text style={styles.emptySubtitle}>
                Sign in to view and manage conversation history.
              </Text>
            </View>
          ) : loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="sync-outline" size={20} color={Colors.primary} />
              <Text style={styles.emptySubtitle}>Loading conversations...</Text>
            </View>
          ) : rows.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="chatbubbles-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>
                {search ? 'No Matches' : 'No Conversations'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search ? 'Try another search term' : 'Start a new chat to create history.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(item) => item.key}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                if (item.type === 'header') {
                  return <Text style={styles.groupHeader}>{item.label}</Text>;
                }

                const isActive = currentConversationId === item.conversation.id;
                return (
                  <Pressable
                    style={[
                      styles.rowCard,
                      isActive && styles.rowCardActive,
                    ]}
                    onPress={() => {
                      onSelectConversation(item.conversation.id);
                      onClose();
                    }}
                  >
                    <View style={styles.rowIcon}>
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={14}
                        color={isActive ? '#DDD6FE' : Colors.textMuted}
                      />
                    </View>
                    <View style={styles.rowContent}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {item.conversation.title || 'New Conversation'}
                      </Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        {formatMetaDate(item.conversation.updated_at)} ·{' '}
                        {item.conversation.total_messages} messages
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => requestDelete(item.conversation.id)}
                    >
                      <Ionicons name="trash-outline" size={14} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </Pressable>
                );
              }}
            />
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLoggedIn ? `${conversations.length} conversations` : 'Guest mode'}
            </Text>
            {isLoggedIn && (
              <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
                <Ionicons name="refresh" size={14} color={Colors.primary} />
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 0, 20, 0.7)',
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: '#030014', // Premium dark background
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
    paddingTop: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  omBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  omText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    ...Typography.body,
    color: '#F8FAFC',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  newChatButton: {
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.glow,
  },
  newChatText: {
    ...Typography.bodySmall,
    color: '#E2E8F0',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  searchBox: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    ...Typography.bodySmall,
    paddingVertical: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  groupHeader: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    marginBottom: 2,
    gap: Spacing.sm,
  },
  rowCardActive: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...Typography.bodySmall,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  rowMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: '#E2E8F0',
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#030014',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  refreshText: {
    ...Typography.caption,
    color: '#C4B5FD',
    fontWeight: '700',
  },
});
