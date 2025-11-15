/**
 * Footer Component
 * Site-wide footer with links and information
 */

import Link from 'next/link';
import { BookOpen, Mail, Github, Heart } from 'lucide-react';
import { ROUTES, APP_TITLE } from '@/lib/utils/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-white to-orange-50/30 border-t border-orange-200/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold">ॐ</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{APP_TITLE}</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Your divine spiritual companion powered by ancient Bhagavad Gita wisdom and modern AI technology.
            </p>
            <p className="text-xs text-gray-500 italic">
              &ldquo;योगस्थः कुरु कर्माणि&rdquo; - Perform your duties established in Yoga
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={ROUTES.HOME}
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.CHAT}
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
                >
                  Chat Interface
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.VOICE}
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
                >
                  Voice Interaction
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ANALYTICS}
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
                >
                  Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ABOUT}
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200"
                >
                  About & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Resources
            </h3>
            <ul className="space-y-2 mb-4">
              <li>
                <a
                  href="/docs"
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Documentation</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@divyavaani.ai"
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact Us</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-orange-200/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {currentYear} DivyaVaani AI. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for spiritual seekers worldwide</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
