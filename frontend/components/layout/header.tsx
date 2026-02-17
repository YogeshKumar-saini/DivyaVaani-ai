import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { MobileSidebar } from './sidebar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOptimizedScroll } from '@/lib/design-system/performance-utils';
import { useAuth } from '@/lib/context/auth-provider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Settings } from 'lucide-react';

interface HeaderProps {
    items: {
        title: string;
        href: string;
    }[];
}

import { AuthModal } from '@/components/auth/auth-modal';

export const Header = React.memo(({ items }: HeaderProps) => {
    const [scrolled, setScrolled] = React.useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, loading } = useAuth();
    const isHome = pathname === '/';

    // Use optimized scroll handler
    useOptimizedScroll((scrollY) => {
        const shouldBeScrolled = scrollY > 50;
        setScrolled((prev) => {
            if (prev !== shouldBeScrolled) {
                return shouldBeScrolled;
            }
            return prev;
        });
    }, []);

    const handleLogin = () => {
        setIsAuthModalOpen(true);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <motion.header
                className={cn(
                    "fixed top-0 z-50 w-full transition-all duration-500 ease-in-out gpu-accelerated",
                    isHome
                        ? (scrolled
                            ? "bg-gradient-to-r from-indigo-950/80 via-white/5 to-purple-950/80 backdrop-blur-2xl border-b border-indigo-200/20 py-3 shadow-2xl"
                            : "bg-transparent border-transparent py-5")
                        : "bg-gradient-to-r from-indigo-950/80 via-white/5 to-purple-950/80 backdrop-blur-2xl border-b border-indigo-200/20 py-3"
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
                                    loading="eager"
                                    priority
                                />
                            </div>
                            <span className={cn(
                                "font-bold text-2xl tracking-tighter transition-all duration-300 hidden sm:block",
                                isHome && !scrolled ? "text-white" : "text-foreground"
                            )}>
                                DivyaVaani
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className={cn(
                        "hidden md:flex items-center space-x-2 p-1.5 rounded-full transition-all duration-500 gpu-accelerated",
                        isHome && !scrolled
                            ? "bg-indigo-950/30 border border-indigo-300/20 backdrop-blur-lg"
                            : "bg-indigo-900/40 border border-indigo-300/25 backdrop-blur-lg"
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
                        {loading ? (
                            <div className="h-9 w-20 animate-pulse rounded-full bg-white/10"></div>
                        ) : user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10 ring-2 ring-white/20 hover:ring-orange-500 transition-all">
                                            <AvatarImage src={user.avatar_url} alt={user.full_name || 'User'} />
                                            <AvatarFallback className="bg-orange-500/20 text-orange-500 font-bold">
                                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.full_name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogin}
                                    className={cn(
                                        "hidden md:flex font-medium transition-colors cursor-pointer",
                                        isHome && !scrolled ? "text-white hover:bg-white/10" : "text-foreground hover:bg-foreground/5"
                                    )}
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={handleLogin}
                                    className={cn(
                                        "rounded-full hover:scale-105 transition-all duration-300 shadow-xl font-bold px-6 gpu-accelerated cursor-pointer",
                                        isHome && !scrolled
                                            ? "bg-white text-black hover:bg-gray-100"
                                            : "bg-orange-600 hover:bg-orange-700 text-white"
                                    )}
                                    size="sm"
                                >
                                    Get Started
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </motion.header>
            <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
        </>
    );
});

Header.displayName = 'Header';