"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/context/auth-provider";
import { conversationService, Conversation } from "@/lib/api/conversation-service";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, MessageSquare, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { isToday, isYesterday, isAfter, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatSidebarProps {
    currentConversationId?: string;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    isOpen?: boolean; // For mobile sheet
    onOpenChange?: (open: boolean) => void; // For mobile sheet
    isCollapsed?: boolean; // For desktop collapse
    onCollapseChange?: (collapsed: boolean) => void; // For desktop collapse
}

export function ChatSidebar({
    currentConversationId,
    onSelectConversation,
    onNewChat,
    isOpen,
    onOpenChange,
    isCollapsed = false,
    onCollapseChange
}: ChatSidebarProps) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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

        // Remove empty groups
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

    const SidebarContent = () => (
        <div className="flex flex-col h-full relative overflow-hidden bg-black/40 backdrop-blur-2xl border-r border-white/10 transition-all duration-300">
            <GrainOverlay />

            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />

            {/* Header / New Chat */}
            <div className={cn("p-4 z-10", isCollapsed ? "items-center flex flex-col" : "")}>
                {isCollapsed ? (
                    <EnhancedButton
                        onClick={() => {
                            onNewChat();
                            if (onOpenChange) onOpenChange(false);
                        }}
                        className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg"
                        title="New Chat"
                        glow
                    >
                        <MessageSquarePlus className="h-5 w-5 text-white" />
                    </EnhancedButton>
                ) : (
                    <EnhancedButton
                        onClick={() => {
                            onNewChat();
                            if (onOpenChange) onOpenChange(false);
                        }}
                        className="w-full justify-start gap-2 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 text-white border border-white/10 shadow-lg"
                        glow
                    >
                        <MessageSquarePlus className="h-4 w-4 text-orange-400" />
                        <span className="font-semibold">New Chat</span>
                    </EnhancedButton>
                )}
            </div>

            {/* History List */}
            <ScrollArea className="flex-1 px-3 z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-white/40">
                        <Loader2 className="h-5 w-5 animate-spin mb-2" />
                        {!isCollapsed && <span className="text-xs">Loading...</span>}
                    </div>
                ) : conversations.length === 0 ? (
                    <div className={cn("text-center py-8 text-white/40 text-sm", isCollapsed && "px-0")}>
                        <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-30" />
                        {!isCollapsed && "No history"}
                    </div>
                ) : (
                    <div className="space-y-6 pb-4">
                        {Object.entries(groupedConversations).map(([group, convs]) => (
                            <div key={group}>
                                {!isCollapsed && (
                                    <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2 mt-2">
                                        {group}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {convs.map((conv) => (
                                        <div
                                            key={conv.id}
                                            onClick={() => {
                                                onSelectConversation(conv.id);
                                                if (onOpenChange) onOpenChange(false);
                                            }}
                                            className={cn(
                                                "group flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl cursor-pointer transition-all duration-200 border border-transparent",
                                                currentConversationId === conv.id
                                                    ? "bg-white/10 text-white border-white/5 shadow-inner"
                                                    : "text-white/60 hover:bg-white/5 hover:text-white hover:border-white/5",
                                                isCollapsed && "justify-center px-0 py-3"
                                            )}
                                            title={isCollapsed ? conv.title : undefined}
                                        >
                                            <MessageSquare className={cn(
                                                "h-4 w-4 shrink-0 transition-colors",
                                                currentConversationId === conv.id ? "text-orange-400" : "opacity-50 group-hover:text-orange-400/70"
                                            )} />

                                            {!isCollapsed && (
                                                <>
                                                    <div className="flex-1 truncate font-medium">
                                                        {conv.title || "New Conversation"}
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDelete(e, conv.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Footer / User Profile */}
            <div className={cn("p-4 border-t border-white/10 bg-black/20 z-10", isCollapsed ? "items-center flex flex-col gap-4" : "")}>
                {user && (
                    <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
                        <Avatar className="h-9 w-9 ring-2 ring-white/10">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-orange-500/20 text-orange-500 text-xs">
                                {user.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
                                <p className="text-xs text-white/40 truncate">{user.email}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Desktop Collapse Toggle */}
                <div className={cn("hidden md:flex mt-2", isCollapsed ? "justify-center" : "justify-end")}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCollapseChange && onCollapseChange(!isCollapsed)}
                        className="text-white/40 hover:text-white hover:bg-white/10 h-8 w-8"
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.div
                initial={false}
                animate={{ width: isCollapsed ? 80 : 320 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden md:flex fixed left-0 top-0 bottom-0 pt-20 z-30"
            >
                <SidebarContent />
            </motion.div>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent side="left" className="p-0 border-r-0 w-80 bg-transparent shadow-2xl">
                    <div className="h-full w-full rounded-r-3xl overflow-hidden border-r border-white/10">
                        <SidebarContent />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
