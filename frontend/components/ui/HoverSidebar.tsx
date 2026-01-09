'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Mic, BarChart2, Info, Home, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HoverSidebarProps {
    onOpenSettings: () => void;
}

export const HoverSidebar = ({ onOpenSettings }: HoverSidebarProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const pathname = usePathname();

    const sidebarVariants = {
        collapsed: { width: '4rem' },
        expanded: { width: '16rem' },
    };

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: MessageSquare, label: 'Chat', href: '/chat' },
        { icon: Mic, label: 'Voice', href: '/voice' },
        { icon: BarChart2, label: 'Analytics', href: '/analytics' },
        { icon: Info, label: 'About', href: '/about' },
    ];

    return (
        <motion.div
            className="fixed left-0 top-20 h-[calc(100vh-5rem)] z-40 flex flex-col bg-black/40 backdrop-blur-xl border-r border-white/10 overflow-hidden shadow-2xl"
            initial="collapsed"
            animate={isHovered ? 'expanded' : 'collapsed'}
            variants={sidebarVariants}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Logo / Header Area */}
            <div className="flex items-center h-16 px-4 border-b border-white/10">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-[0_0_15px_rgba(234,88,12,0.4)] text-white shrink-0">
                    <Mic className="h-4 w-4" />
                </div>
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="ml-4 font-bold text-lg text-white whitespace-nowrap"
                        >
                            DivyaVaani
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 py-8 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.label} href={item.href} className="w-full">
                            <div
                                className={cn(
                                    "flex items-center h-12 px-4 cursor-pointer transition-colors relative",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-orange-400")} />
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="ml-4 font-medium whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Active Indicator Line */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10">
                <Button
                    variant="ghost"
                    className="w-full justify-start p-0 hover:bg-transparent group"
                    onClick={onOpenSettings}
                >
                    <div className="flex items-center h-12 w-full">
                        <Settings className="h-5 w-5 text-white/60 group-hover:text-white shrink-0" />
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="ml-4 text-white/60 group-hover:text-white whitespace-nowrap"
                                >
                                    Settings
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Button>
            </div>
        </motion.div>
    );
};
