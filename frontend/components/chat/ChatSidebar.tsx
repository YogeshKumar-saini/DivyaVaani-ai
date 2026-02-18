"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/context/auth-provider";
import { conversationService, Conversation } from "@/lib/api/conversation-service";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, MessageSquare, Trash2, Loader2, Search, X } from "lucide-react";
import { isToday, isYesterday, isAfter, subDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { LanguageDetector } from "@/components/LanguageSelector";

interface ChatSidebarProps {
    currentConversationId?: string;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    // Legacy props for backward compat or mobile sheet usage if needed
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    isCollapsed?: boolean;
    onCollapseChange?: (collapsed: boolean) => void;
    // New prop for Ethereal Layout
    embedded?: boolean;
}

export function ChatSidebar({
    currentConversationId,
    onSelectConversation,
    onNewChat,
    isOpen,
    onOpenChange,
    isCollapsed = false,
    // onCollapseChange unused — kept for API compatibility
    embedded = false
}: ChatSidebarProps) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [groupedConversations, setGroupedConversations] = useState<Record<string, Conversation[]>>({});

    const groupConversations = useCallback((data: Conversation[]) => {
        const groups: Record<string, Conversation[]> = {
            "Today": [],
            "Yesterday": [],
            "Previous 7 Days": [],
            "Older": []
        };

        data.forEach(conv => {
            const date = new Date(conv.updated_at || conv.created_at);
            if (isToday(date)) {
                groups["Today"].push(conv);
            } else if (isYesterday(date)) {
                groups["Yesterday"].push(conv);
            } else if (isAfter(date, subDays(new Date(), 7))) {
                groups["Previous 7 Days"].push(conv);
            } else {
                groups["Older"].push(conv);
            }
        });

        Object.keys(groups).forEach(key => {
            if (groups[key].length === 0) {
                delete groups[key];
            }
        });

        setGroupedConversations(groups);
    }, []);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await conversationService.getConversations(user.id);
            setConversations(data);
            groupConversations(data);
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, groupConversations]);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await conversationService.deleteConversation(id);
            setConversations(prev => {
                const updated = prev.filter(c => c.id !== id);
                groupConversations(updated);
                return updated;
            });
            if (currentConversationId === id) {
                onNewChat();
            }
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        }
    };

    const filteredConversations = searchQuery.trim()
        ? conversations.filter(c =>
            (c.title || "New Conversation").toLowerCase().includes(searchQuery.toLowerCase())
          )
        : conversations;

    const filteredGrouped = searchQuery.trim()
        ? { "Search Results": filteredConversations }
        : groupedConversations;

    const SidebarContent = () => (
        <div className={cn("flex flex-col h-full", !embedded && "relative overflow-hidden bg-black/20 backdrop-blur-3xl border-r border-white/10")}>
            {/* Ambient top glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-violet-900/12 to-transparent pointer-events-none z-0" />

            {/* Header — New Chat button */}
            <div className="px-3 pt-4 pb-3 z-10 space-y-3">
                <button
                    onClick={() => {
                        onNewChat();
                        if (onOpenChange) onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-linear-to-r from-violet-600/25 to-indigo-600/15 hover:from-violet-600/35 hover:to-indigo-600/25 border border-violet-500/25 hover:border-violet-400/50 text-white text-sm font-medium transition-all duration-300 group shadow-lg shadow-violet-900/15 active:scale-[0.98]"
                >
                    <MessageSquarePlus className="h-4 w-4 text-violet-300 group-hover:rotate-12 transition-transform duration-300" />
                    <span>New Conversation</span>
                    <div className="ml-auto text-[10px] text-violet-400/50 font-mono opacity-0 group-hover:opacity-100 transition-opacity">⌘N</div>
                </button>

                {/* Search input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full bg-white/4 border border-white/7 rounded-xl pl-9 pr-8 py-2 text-[13px] text-white/70 placeholder-white/20 focus:outline-none focus:border-violet-500/30 focus:bg-white/6 transition-all duration-200"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Conversations list */}
            <ScrollArea className="flex-1 px-3 z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-white/30">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        >
                            <Loader2 className="h-5 w-5 mb-3" />
                        </motion.div>
                        <span className="text-[12px] font-light">Loading history...</span>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-14 px-4">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-white/4 border border-white/6 flex items-center justify-center mb-4 shadow-inner">
                            <MessageSquare className="h-5 w-5 text-white/15" />
                        </div>
                        <p className="text-white/30 text-[13px] font-light">
                            {searchQuery ? "No results found" : "No conversations yet"}
                        </p>
                        <p className="text-white/15 text-[11px] mt-1.5">
                            {searchQuery ? "Try a different search term" : "Start a new conversation above"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5 pb-6 pt-1">
                        <AnimatePresence mode="popLayout">
                            {Object.entries(filteredGrouped).map(([group, convs]) => (
                                convs.length > 0 && (
                                    <motion.div
                                        key={group}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <h3 className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.18em] px-2 mb-2 mt-1">
                                            {group}
                                        </h3>
                                        <div className="space-y-0.5">
                                            {convs.map((conv) => {
                                                const isActive = currentConversationId === conv.id;
                                                const date = new Date(conv.updated_at || conv.created_at);
                                                const timeStr = isToday(date)
                                                    ? format(date, "h:mm a")
                                                    : format(date, "MMM d");
                                                return (
                                                    <motion.div
                                                        key={conv.id}
                                                        layout
                                                        initial={{ opacity: 0, x: -6 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -6, height: 0 }}
                                                        transition={{ duration: 0.18 }}
                                                        onClick={() => {
                                                            onSelectConversation(conv.id);
                                                            if (onOpenChange) onOpenChange(false);
                                                        }}
                                                        className={cn(
                                                            "group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden",
                                                            isActive
                                                                ? "bg-violet-500/12 border border-violet-500/25 text-white shadow-sm shadow-violet-900/10"
                                                                : "text-white/45 hover:text-white/80 hover:bg-white/4 border border-transparent hover:border-white/5"
                                                        )}
                                                    >
                                                        {/* Active left bar */}
                                                        {isActive && (
                                                            <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-linear-to-b from-violet-400 to-indigo-500 rounded-full" />
                                                        )}

                                                        <MessageSquare className={cn(
                                                            "h-3.5 w-3.5 shrink-0 transition-colors",
                                                            isActive ? "text-violet-400" : "text-white/20 group-hover:text-white/45"
                                                        )} />

                                                        <div className="flex-1 min-w-0">
                                                            <div className="truncate text-[13px] font-light leading-tight">
                                                                {conv.title || "New Conversation"}
                                                            </div>
                                                            <div className="text-[10px] text-white/20 mt-0.5">{timeStr}</div>
                                                        </div>

                                                        <button
                                                            onClick={(e) => handleDelete(e, conv.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/15 hover:text-red-400 rounded-lg transition-all text-white/15 shrink-0"
                                                            title="Delete conversation"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-white/6 z-10 space-y-2">
                {/* Stats row */}
                {conversations.length > 0 && (
                    <div className="flex items-center justify-between px-1 mb-2">
                        <span className="text-[10px] text-white/20 font-light">
                            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                        </span>
                    </div>
                )}
                <div className="rounded-xl bg-white/3 border border-white/5 p-3">
                    <h4 className="text-[10px] uppercase tracking-wider text-white/25 font-semibold mb-2">Language</h4>
                    <LanguageDetector currentDetectedLanguage="en" />
                </div>
            </div>
        </div>
    );

    if (embedded) {
        return <SidebarContent />;
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.div
                initial={false}
                animate={{ width: isCollapsed ? 80 : 320 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.1 }}
                className="hidden md:flex relative h-full shrink-0 z-30"
            >
                <div className="flex flex-col h-full w-full relative overflow-hidden bg-black/20 backdrop-blur-3xl border-r border-white/10">
                    <SidebarContent />
                </div>
            </motion.div>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent side="left" className="p-0 border-r-0 w-80 bg-transparent shadow-2xl">
                    <div className="h-full w-full rounded-r-3xl overflow-hidden border-r border-white/10 bg-black/80 backdrop-blur-xl">
                        <SidebarContent />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
