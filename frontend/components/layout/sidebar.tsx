'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Menu, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { HTMLMotionProps } from 'framer-motion';

interface SidebarProps extends HTMLMotionProps<"div"> {
  items: {
    title: string;
    href: string;
    icon?: React.ReactNode;
  }[];
  collapsible?: boolean;
}

export function Sidebar({ className, items, collapsible = true, ...props }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <motion.div
      className={cn(
        'relative h-screen bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col z-40 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-72',
        className
      )}
      initial={false}
      animate={{ width: isCollapsed ? 80 : 288 }}
      {...props}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute top-1/2 -right-24 w-48 h-48 bg-purple-500/20 blur-[100px] rounded-full" />
      </div>

      <div className="flex h-16 items-center px-4 py-4 mb-4 border-b border-white/5 relative z-10">
        <div className={cn("flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all", isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full")}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
            D
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            DivyaVaani
          </span>
        </div>

        {collapsible && (
          <Button
            variant="ghost"
            size="icon"
            className={cn("absolute right-2 h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10 rounded-full", isCollapsed && "right-1/2 translate-x-1/2")}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        )}
      </div>

      <div className="flex-1 px-3 py-2 space-y-1 relative z-10 overflow-y-auto overflow-x-hidden scrollbar-thin">
        <TooltipProvider delayDuration={0}>
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                      isActive
                        ? 'text-white'
                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-white/5 rounded-lg"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}

                    <span className={cn("relative z-10", isActive && "text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]")}>
                      {item.icon}
                    </span>

                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="relative z-10 whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                    )}

                    {isActive && !isCollapsed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]"
                      />
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

      <div className="p-4 relative z-10">
        {!isCollapsed ? (
          <div className="rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-noise opacity-20" />
            <div className="relative z-10">
              <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-300" /> Premium
              </h4>
              <p className="text-xs text-slate-300 mb-3">Unlock advanced spiritual insights and voice features.</p>
              <Button size="sm" className="w-full bg-white text-black hover:bg-slate-100 shadow-lg font-semibold text-xs h-8">
                Upgrade Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button size="icon" className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg hover:scale-110 transition-transform">
              <Sparkles size={18} className="text-white" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function MobileSidebar({ items }: SidebarProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
          <Menu size={24} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 bg-[#020617]/95 backdrop-blur-3xl border-r border-white/10">
        <SheetHeader className="p-6 border-b border-white/5">
          <SheetTitle className="text-2xl font-serif text-white flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg text-base">
              D
            </div>
            DivyaVaani
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 py-6 space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200',
                pathname === item.href
                  ? 'bg-white/10 text-white shadow-lg border border-white/5'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span className={cn(pathname === item.href ? "text-primary" : "")}>{item.icon}</span>
              <span className="font-medium">{item.title}</span>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-6 left-4 right-4">
          <div className="rounded-xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 p-4 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-300" /> Premium Access
              </h4>
              <Button size="sm" className="w-full mt-3 bg-white text-black hover:bg-slate-100 shadow-lg font-semibold h-9">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
