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
import { LogOut, User as UserIcon, Settings, Sparkles, ChevronRight } from 'lucide-react';
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

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  const handleLogin = () => setIsAuthModalOpen(true);
  const handleLogout = () => logout();

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 z-50 w-full transition-all duration-500 ease-in-out',
          scrolled
            ? 'bg-background/40 backdrop-blur-xl border-b border-white/10 py-3 shadow-lg'
            : 'bg-transparent py-5 border-b border-transparent'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-6">
            <MobileSidebar items={items} />
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-white/20 group-hover:ring-primary/50 transition-all duration-500 shadow-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm">
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
              <div className="hidden sm:block">
                <span className="block font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                  DivyaVaani
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">
                  Universal Wisdom
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-3xl border border-white/10 p-1.5 rounded-full shadow-2xl">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 relative group',
                    isActive ? 'text-white' : 'text-muted-foreground hover:text-white'
                  )}
                >
                  <span className="relative z-10">{item.title}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-primary/80 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 overflow-hidden ring-2 ring-white/10 hover:ring-primary/50 transition-all duration-300">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.avatar_url} alt={user.full_name || 'User'} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 bg-black/90 backdrop-blur-xl border-white/10 text-white" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="focus:bg-white/10 focus:text-white cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')} className="focus:bg-white/10 focus:text-white cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300 focus:bg-red-950/30 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleLogin}
                  className="hidden sm:flex text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleLogin}
                  className="rounded-full bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] font-semibold px-6"
                >
                  Get Started <ChevronRight className="ml-1 h-3.5 w-3.5" />
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
