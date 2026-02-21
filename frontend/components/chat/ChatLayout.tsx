"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PanelLeftOpen, X } from "lucide-react";

interface ChatLayoutProps {
    children: React.ReactNode;
    sidebarContent: React.ReactNode;
    isSidebarOpen: boolean;
    onSidebarToggle: (open: boolean) => void;
}

export function ChatLayout({ children, sidebarContent, isSidebarOpen, onSidebarToggle }: ChatLayoutProps) {
    return (
        <div className="flex h-full w-full overflow-hidden bg-transparent">
            {/* ── Sidebar (Sheet) ── */}
            <Sheet open={isSidebarOpen} onOpenChange={onSidebarToggle}>
                <SheetContent side="left" className="p-0 border-r-0 w-[280px] sm:w-[300px] bg-transparent shadow-2xl border-none">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Chat Sidebar</SheetTitle>
                        <SheetDescription>Navigate through your conversations</SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col h-full w-full rounded-r-3xl overflow-hidden border-r border-white/10 bg-slate-950/80 backdrop-blur-2xl">
                        {/* Sidebar header */}
                        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/6 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-lg bg-linear-to-br from-cyan-300 to-amber-200 flex items-center justify-center shadow-sm shadow-cyan-900/30">
                                    <span className="text-white text-[10px] font-bold">ॐ</span>
                                </div>
                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                                    Conversations
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onSidebarToggle(false)}
                                className="h-7 w-7 text-white/30 hover:text-white hover:bg-white/8 rounded-xl transition-all"
                            >
                                <X size={14} />
                            </Button>
                        </div>

                        {/* Sidebar body */}
                        <div className="flex-1 overflow-hidden">
                            {sidebarContent}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* ── Main chat area ── */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
                {/* Floating Toggle Button (Always visible when sidebar is closed) */}
                <AnimatePresence>
                    {!isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.18 }}
                            className="absolute top-3 left-3 z-40"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onSidebarToggle(true)}
                                className="h-9 w-9 rounded-xl bg-slate-950/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-white/10 shadow-lg shadow-black/20 transition-all duration-200"
                                title="Open conversations"
                            >
                                <PanelLeftOpen size={16} />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {children}
            </main>
        </div>
    );
}
