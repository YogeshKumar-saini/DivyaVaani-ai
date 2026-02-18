"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, X } from "lucide-react";

interface ChatLayoutProps {
    children: React.ReactNode;
    sidebarContent: React.ReactNode;
    isSidebarOpen: boolean;
    onSidebarToggle: (open: boolean) => void;
}

export function ChatLayout({ children, sidebarContent, isSidebarOpen, onSidebarToggle }: ChatLayoutProps) {
    return (
        <div className="flex h-full w-full overflow-hidden bg-transparent">

            {/* ── Desktop Sidebar ── */}
            <AnimatePresence initial={false}>
                {isSidebarOpen && (
                    <motion.aside
                        key="desktop-sidebar"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 340, damping: 34 }}
                        className="hidden md:flex flex-col shrink-0 h-full overflow-hidden
                                   bg-slate-950/65 backdrop-blur-2xl border-r border-white/10 z-30"
                    >
                        {/* Sidebar header — title + close */}
                        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/6 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-lg bg-linear-to-br from-cyan-300 to-amber-200 flex items-center justify-center shadow-md shadow-cyan-900/30">
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
                                className="h-7 w-7 text-white/25 hover:text-white hover:bg-white/8 rounded-xl transition-all"
                            >
                                <PanelLeftClose size={14} />
                            </Button>
                        </div>

                        {/* Sidebar body */}
                        <div className="flex-1 overflow-hidden">
                            {sidebarContent}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ── Main chat area ── */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
                {/* Desktop toggle button */}
                <div className="hidden md:flex items-center px-3 pt-3 pb-0 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSidebarToggle(!isSidebarOpen)}
                        className="h-8 w-8 rounded-xl bg-white/6 hover:bg-white/12 border border-white/12 hover:border-cyan-200/40 text-white/60 hover:text-white backdrop-blur-md transition-all duration-200 shadow-sm"
                        title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
                    </Button>
                </div>

                {children}
            </main>

            {/* ── Mobile: Overlay drawer ── */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        {/* Backdrop blur overlay */}
                        <motion.div
                            key="mobile-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-black/65 backdrop-blur-sm"
                            onClick={() => onSidebarToggle(false)}
                        />

                        {/* Slide-in drawer */}
                        <motion.aside
                            key="mobile-drawer"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 360, damping: 36 }}
                            className="md:hidden fixed left-0 z-50 flex flex-col
                                       w-[82vw] max-w-[300px]
                                       top-16 bottom-0 h-auto
                                       bg-slate-950/96 backdrop-blur-2xl border-r border-white/10
                                       shadow-2xl shadow-black/50"
                        >
                            {/* Drawer header */}
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

                            {/* Drawer body */}
                            <div className="flex-1 overflow-hidden">
                                {sidebarContent}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Mobile: Floating open button (only when sidebar closed) ── */}
            <AnimatePresence>
                {!isSidebarOpen && (
                    <motion.div
                        key="mobile-open-btn"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.18 }}
                        className="md:hidden fixed top-[68px] left-3 z-40"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSidebarToggle(true)}
                            className="h-9 w-9 rounded-xl bg-slate-950/70 backdrop-blur-xl border border-white/12 text-white/60 hover:text-white hover:bg-white/10 shadow-lg shadow-black/30 transition-all duration-200"
                            title="Open conversations"
                        >
                            <PanelLeftOpen size={15} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
