'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { MobileSidebar } from './sidebar';
import { cn } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/auth-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, ChevronRight, LayoutDashboard } from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';

interface HeaderProps {
  items: {
    title: string;
    href: string;
  }[];
}

export const Header = React.memo(({ items }: HeaderProps) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <>
      <motion.header
        className={cn('fixed top-0 z-50 w-full transition-all duration-500', scrolled ? 'py-2' : 'py-4')}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
      >
        <div
          className={cn(
            'absolute inset-0 transition-all duration-500',
            scrolled
              ? 'border-b border-white/10 bg-slate-950/72 backdrop-blur-2xl shadow-[0_18px_42px_rgba(2,6,23,0.45)]'
              : 'bg-transparent border-b border-transparent'
          )}
        />

        <div className="section-shell relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MobileSidebar items={items} />
            <Link href="/" className="group hidden sm:flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/15 bg-white/10 shadow-lg shadow-cyan-950/60">
                <Image
                  src="/images/logo.png"
                  alt="DivyaVaani"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="eager"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span className="block text-[15px] font-bold leading-none text-white">DivyaVaani</span>
                <span className="block pt-1 text-[9px] uppercase tracking-[0.26em] text-cyan-100/65">Universal Wisdom</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/12 bg-white/6 p-1 backdrop-blur-xl">
            {items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors',
                    isActive ? 'text-slate-950' : 'text-slate-100/70 hover:text-white'
                  )}
                >
                  <span className="relative z-10">{item.title}</span>
                  {isActive ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-300 to-amber-200"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                    />
                  ) : (
                    <span className="absolute inset-0 rounded-full transition-colors hover:bg-white/8" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-white/12" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-white/15 bg-white/6 hover:bg-white/12"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.avatar_url} alt={user.full_name || 'User'} crossOrigin="anonymous" />
                      <AvatarFallback className="bg-cyan-500/20 text-cyan-100 font-bold text-sm">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-2xl border-white/10 bg-slate-900/95 text-white backdrop-blur-xl"
                  align="end"
                  sideOffset={10}
                >
                  <DropdownMenuLabel className="px-4 py-3">
                    <p className="text-sm font-semibold text-white">{user.full_name}</p>
                    <p className="truncate pt-0.5 text-[11px] text-white/55">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="mx-1 my-0.5 rounded-xl text-white/75 focus:bg-white/10 focus:text-white"
                  >
                    <UserIcon className="mr-2.5 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/analytics')}
                    className="mx-1 my-0.5 rounded-xl text-white/75 focus:bg-white/10 focus:text-white"
                  >
                    <LayoutDashboard className="mr-2.5 h-4 w-4 text-cyan-300" />
                    <span>Analytics</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="mx-1 my-0.5 rounded-xl text-red-300/90 focus:bg-red-950/35 focus:text-red-200"
                  >
                    <LogOut className="mr-2.5 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden sm:flex h-9 rounded-full px-4 text-[13px] font-medium text-white/75 hover:bg-white/8 hover:text-white"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="h-9 rounded-full border border-cyan-200/40 bg-gradient-to-r from-cyan-300 to-amber-200 px-5 text-[13px] font-semibold text-slate-950 hover:brightness-105"
                >
                  Get Started
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.header>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
});

Header.displayName = 'Header';
