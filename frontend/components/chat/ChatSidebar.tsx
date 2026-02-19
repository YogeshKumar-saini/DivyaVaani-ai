"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/context/auth-provider";
import { conversationService, Conversation } from "@/lib/api/conversation-service";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MessageSquarePlus, MessageSquare, Trash2, Loader2, Search, X } from "lucide-react";
import { isToday, isYesterday, isAfter, subDays } from "date-fns";
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
        <div className={cn("flex flex-col h-full relative", !embedded && "overflow-hidden bg-black/20 backdrop-blur-3xl border-r border-white/10")}>
            {/* Ambient top glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-violet-900/12 to-transparent pointer-events-none z-0" />

            {/* Inline styles for marquee animation and hide-scrollbar */}
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 10s linear infinite;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* Header — New Chat button */}
            <div className="px-4 pt-5 pb-4 z-10 space-y-4 shrink-0">
                <button
                    onClick={() => {
                        onNewChat();
                        if (onOpenChange) onOpenChange(false);
                    }}
                    className={cn(
                        "w-full flex items-center justify-center gap-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[14px] font-medium transition-all duration-200 shadow-lg shadow-violet-900/20 active:scale-[0.98]",
                        isCollapsed ? "px-2 py-3" : "px-4 py-3"
                    )}
                >
                    <MessageSquarePlus className="h-4 w-4 text-violet-100" />
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="whitespace-nowrap overflow-hidden"
                        >
                            New Chat
                        </motion.span>
                    )}
                </button>

                {/* Search input - Hide when collapsed for cleaner look, or show icon only if desired */}
                {!isCollapsed && (
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search chats..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-9 pr-8 py-2.5 text-[13px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/30 focus:bg-slate-900/80 transition-all duration-200"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Conversations list - scrollable area taking remaining space */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-3 z-10 min-h-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        >
                            <Loader2 className="h-5 w-5 mb-3" />
                        </motion.div>
                        <span className="text-[12px] font-medium">Loading history...</span>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-14 px-4">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-center mb-4">
                            <MessageSquare className="h-5 w-5 text-slate-600" />
                        </div>
                        {!isCollapsed && (
                            <>
                                <p className="text-slate-400 text-[13px] font-medium">
                                    {searchQuery ? "No results found" : "No conversations yet"}
                                </p>
                                <p className="text-slate-600 text-[11px] mt-1.5">
                                    {searchQuery ? "Try a different search term" : "Start a new conversation above"}
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 pb-6 pt-2">
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
                                        {!isCollapsed && (
                                            <h3 className="text-[10px] font-bold text-slate-500/80 uppercase tracking-wider px-3 mb-2.5">
                                                {group}
                                            </h3>
                                        )}
                                        <div className="space-y-1">
                                            {convs.map((conv) => {
                                                const isActive = currentConversationId === conv.id;
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
                                                            "group flex items-center gap-3 rounded-lg cursor-pointer transition-all duration-200 relative overflow-hidden",
                                                            isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                                                            isActive
                                                                ? "bg-slate-800/80 text-white shadow-sm"
                                                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                                        )}
                                                        title={isCollapsed ? conv.title : undefined}
                                                    >
                                                        {/* Active indicator */}
                                                        {isActive && (
                                                            <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-violet-500" />
                                                        )}

                                                        <MessageSquare className={cn(
                                                            "h-4 w-4 shrink-0 transition-colors z-10 relative",
                                                            isActive ? "text-violet-400" : "text-slate-600 group-hover:text-slate-400"
                                                        )} />

                                                        {!isCollapsed && (
                                                            <div className="flex-1 min-w-0 relative overflow-hidden">
                                                                {/* Title Container with Marquee Effect */}
                                                                <div className="relative overflow-hidden h-[18px]">
                                                                    <div className={cn(
                                                                        "text-[13px] leading-tight whitespace-nowrap absolute top-0 left-0",
                                                                        isActive ? "font-medium" : "font-normal",
                                                                        // Only animate on hover if text is long enough? CSS makes this tricky without JS measure.
                                                                        // Simpler: animate on hover regardless but paused otherwise.
                                                                        "group-hover:animate-marquee"
                                                                    )}
                                                                        style={{
                                                                            width: "max-content",
                                                                            paddingRight: "100%" // Space to prevent abrupt repeat if we allow loop, or just ensures width is enough
                                                                        }}>
                                                                        {conv.title || "New Conversation"} &nbsp;&nbsp;&nbsp;&nbsp; {conv.title || "New Conversation"}
                                                                    </div>
                                                                    {/* Static overlay/version to show when not hovering? 
                                                                        Tricky. Just duplicate content for seamless loop or use JS.
                                                                        User said "going from right to left like instead of truncate".
                                                                        Let's implement a simple transform translateX on hover.
                                                                    */}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!isCollapsed && (
                                                            <button
                                                                onClick={(e) => handleDelete(e, conv.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-all text-slate-600 shrink-0 z-10 relative"
                                                                title="Delete conversation"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
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
            </div>

            {/* Footer - Pinned to bottom (mt-auto handled by flex-1 above taking available space) */}
            <div className="p-3 border-t border-white/6 z-10 space-y-2 mt-auto shrink-0 bg-transparent backdrop-blur-md">
                {/* Stats row */}
                {conversations.length > 0 && (
                    <div className="flex items-center justify-between px-1 mb-2">
                        <span className="text-[10px] text-white/20 font-light">
                            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                        </span>
                    </div>
                )}
                <div className="rounded-xl bg-white/3 border border-white/5 p-3">
                    {!isCollapsed && <h4 className="text-[10px] uppercase tracking-wider text-white/25 font-semibold mb-2">Language</h4>}
                    <LanguageDetector currentDetectedLanguage="en" isCollapsed={isCollapsed} />
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
