"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    MessageSquare,
    Mic,
    BarChart2,
    User,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Sparkles,
    Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/context/auth-provider";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Defining the navigation items
const NAV_ITEMS = [
    { title: "Home", href: "/", icon: Home },
    { title: "Chat", href: "/chat", icon: MessageSquare },
    { title: "Voice", href: "/voice", icon: Mic },
    { title: "Analytics", href: "/analytics", icon: BarChart2 },
    { title: "Profile", href: "/profile", icon: User },
];

export const AppSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border-r border-white/10 text-white">
            {/* Header / Logo Area */}
            <div className={cn(
                "flex items-center h-16 px-4 border-b border-white/10 transition-all duration-300",
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                            D
                        </div>
                        <span>DivyaVaani</span>
                    </motion.div>
                )}

                {isCollapsed && (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg font-bold">
                        D
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("hidden md:flex text-white/50 hover:text-white hover:bg-white/10", isCollapsed && "hidden")}
                    onClick={() => setIsCollapsed(true)}
                >
                    <ChevronLeft size={18} />
                </Button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-hide">
                <TooltipProvider delayDuration={0}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                            isActive
                                                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/5"
                                                : "text-white/60 hover:text-white hover:bg-white/5",
                                            isCollapsed && "justify-center px-2"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-nav"
                                                className="absolute left-0 w-1 h-6 bg-cyan-400 rounded-r-full"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            />
                                        )}

                                        <Icon size={20} className={cn("shrink-0 transition-transform", isActive && "scale-110 text-cyan-300")} />

                                        {!isCollapsed && (
                                            <span className="font-medium whitespace-nowrap">{item.title}</span>
                                        )}
                                    </Link>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right" className="bg-slate-900 border-white/10 text-white">
                                        {item.title}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>

            {/* Bottom Actions / User Profile */}
            <div className="p-4 border-t border-white/10 space-y-4">
                {!isCollapsed && (
                    <div className="rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 p-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-noise opacity-30" />
                        <div className="relative z-10">
                            <h4 className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
                                <Sparkles size={14} className="text-amber-300" /> Premium
                            </h4>
                            <p className="text-[10px] text-white/50 mb-3 leading-tight">Unlock advanced AI models & voice features.</p>
                            <Button size="sm" className="w-full bg-white text-black hover:bg-slate-100 shadow-lg font-semibold text-xs h-7">
                                Upgrade
                            </Button>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <div className="flex justify-center mb-4">
                        <Button size="icon" className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg p-0">
                            <Sparkles size={14} className="text-white" />
                        </Button>
                    </div>
                )}

                <div className={cn("flex items-center gap-3 pt-2", isCollapsed ? "justify-center flex-col" : "")}>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="h-9 w-9 border border-white/10 cursor-pointer hover:border-white/30 transition-colors">
                                    <AvatarImage src={user?.avatar_url} crossOrigin="anonymous" />
                                    <AvatarFallback className="bg-indigo-950 text-indigo-200 text-xs">
                                        {user?.full_name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            {isCollapsed && <TooltipContent side="right">Profile</TooltipContent>}
                        </Tooltip>
                    </TooltipProvider>

                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.full_name || "User"}</p>
                            <p className="text-xs text-white/40 truncate">{user?.email}</p>
                        </div>
                    )}

                    {!isCollapsed && (
                        <Button variant="ghost" size="icon" className="text-white/40 hover:text-red-400 hover:bg-red-500/10 h-8 w-8" onClick={logout}>
                            <LogOut size={16} />
                        </Button>
                    )}
                </div>

                {isCollapsed && (
                    <div className="flex justify-center">
                        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white h-8 w-8" onClick={() => setIsCollapsed(false)}>
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle Button (Fixed on screen) */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-black/40 backdrop-blur-md border-white/10 text-white"
                    onClick={() => setIsMobileOpen(true)}
                >
                    <Menu size={20} />
                </Button>
            </div>

            {/* Desktop Sidebar */}
            <motion.aside
                className="hidden md:block fixed inset-y-0 left-0 z-40 h-screen"
                animate={{ width: isCollapsed ? 80 : 280 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <SidebarContent />
            </motion.aside>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                            onClick={() => setIsMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="md:hidden fixed inset-y-0 left-0 z-50 w-72 h-full"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
