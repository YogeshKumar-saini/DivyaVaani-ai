import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MobileSidebar } from './sidebar';
import { cn } from '@/lib/utils';
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface HeaderProps {
    items: {
        title: string;
        href: string;
    }[];
}

export function Header({ items }: HeaderProps) {
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = React.useState(false);
    const pathname = usePathname();
    const isHome = pathname === '/';

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50 && !scrolled) {
            setScrolled(true);
        } else if (latest <= 50 && scrolled) {
            setScrolled(false);
        }
    });

    return (
        <motion.header
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-500 ease-in-out",
                isHome
                    ? (scrolled
                        ? "bg-background/80 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl"
                        : "bg-transparent border-transparent py-5")
                    : "bg-background/80 backdrop-blur-xl border-b border-white/10 py-3"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-6">
                    <MobileSidebar items={items} />
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/20 group-hover:ring-orange-500 transition-all duration-500 shadow-xl bg-orange-500/10">
                            <Image
                                src="/images/logo.png"
                                alt="DivyaVaani"
                                width={40}
                                height={40}
                                className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                        <span className={cn(
                            "font-bold text-2xl tracking-tighter transition-all duration-300",
                            isHome && !scrolled ? "text-white" : "text-foreground"
                        )}>
                            DivyaVaani
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className={cn(
                    "hidden md:flex items-center space-x-2 p-1 rounded-full transition-all duration-500",
                    isHome && !scrolled
                        ? "bg-white/5 border border-white/10 backdrop-blur-md"
                        : "bg-foreground/5 border border-foreground/5 backdrop-blur-sm"
                )}>
                    {items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 relative group overflow-hidden",
                                    isHome && !scrolled
                                        ? "text-white/80 hover:text-white"
                                        : "text-muted-foreground hover:text-foreground",
                                    isActive && (isHome && !scrolled ? "text-white" : "text-foreground")
                                )}
                            >
                                <span className="relative z-10">{item.title}</span>
                                {isActive && (
                                    <motion.span
                                        layoutId="nav-active"
                                        className={cn(
                                            "absolute inset-0 rounded-full -z-0",
                                            isHome && !scrolled ? "bg-white/20" : "bg-orange-500/10"
                                        )}
                                    />
                                )}
                                <span className={cn(
                                    "absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100 -z-0 rounded-full",
                                    isHome && !scrolled ? "bg-white/10" : "bg-orange-500/5"
                                )}></span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "hidden md:flex font-medium transition-colors",
                            isHome && !scrolled ? "text-white hover:bg-white/10" : "text-foreground hover:bg-foreground/5"
                        )}
                    >
                        Login
                    </Button>
                    <Button className={cn(
                        "rounded-full hover:scale-105 transition-all duration-300 shadow-xl font-bold px-6",
                        isHome && !scrolled
                            ? "bg-white text-black hover:bg-gray-100"
                            : "bg-orange-600 hover:bg-orange-700 text-white"
                    )} size="sm">
                        Get Started
                    </Button>
                </div>
            </div>
        </motion.header>
    );
}
