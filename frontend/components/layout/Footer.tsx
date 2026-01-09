
'use client';

import Link from 'next/link';
import { Mail, Github, Heart, Send, LucideIcon } from 'lucide-react';
import { ROUTES, APP_TITLE } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-xl text-white py-20">

      {/* Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
                <span className="text-white font-bold text-xl">ॐ</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                {APP_TITLE}
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Your divine spiritual companion powered by ancient wisdom and modern AI.
              Bridging the gap between timeless scripture and daily life.
            </p>
            <div className="flex items-center space-x-4">
              <SocialLink href="#" icon={Github} />
              <SocialLink href="#" icon={Mail} />
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-sm font-semibold text-orange-400 tracking-wider uppercase mb-6">Platform</h4>
            <ul className="space-y-4">
              <FooterLink href={ROUTES.HOME}>Home</FooterLink>
              <FooterLink href={ROUTES.CHAT}>Chat</FooterLink>
              <FooterLink href={ROUTES.VOICE}>Voice Mode</FooterLink>
              <FooterLink href={ROUTES.ANALYTICS}>Analytics</FooterLink>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-orange-400 tracking-wider uppercase mb-6">Resources</h4>
            <ul className="space-y-4">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-orange-400 tracking-wider uppercase mb-6">Stay Connected</h4>
            <p className="text-gray-400 text-sm mb-4">
              Receive weekly wisdom and updates.
            </p>
            <div className="flex space-x-2 bg-white/5 p-1 rounded-lg border border-white/10 focus-within:border-orange-500/50 transition-colors">
              <Input
                type="email"
                placeholder="Email address"
                className="bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0 h-10"
              />
              <Button size="icon" className="bg-orange-600 hover:bg-orange-700 h-10 w-10 shrink-0 rounded-md">
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} DivyaVaani AI. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: LucideIcon }) {
  return (
    <a
      href={href}
      className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm block">
        {children}
      </Link>
    </li>
  );
}
