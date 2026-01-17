'use client';

import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail('');

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1000);
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 via-white/10 to-purple-950/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-[120px] animate-pulse-slow" />

      <div className="container relative z-10 mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Main Card */}
          <div className="relative bg-gradient-to-br from-indigo-100/10 to-purple-100/10 backdrop-blur-xl rounded-[2.5rem] border border-indigo-200/20 overflow-hidden shadow-2xl">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Side - Content */}
                <div className="text-center lg:text-left space-y-6">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 backdrop-blur-sm"
                  >
                    <Sparkles className="w-4 h-4 text-orange-300" />
                    <span className="text-sm font-semibold text-orange-200 uppercase tracking-wide">
                      Stay Connected
                    </span>
                  </motion.div>

                  {/* Heading */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                      Journey of{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300">
                        Enlightenment
                      </span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-300/90 leading-relaxed font-light">
                      Subscribe to receive weekly spiritual insights, AI updates, and exclusive
                      wisdom from ancient texts delivered to your inbox.
                    </p>
                  </motion.div>

                  {/* Benefits List */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="hidden lg:block space-y-3"
                  >
                    {[
                      'Weekly spiritual wisdom & insights',
                      'Exclusive AI features early access',
                      'Personalized guidance recommendations',
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="h-5 w-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                        </div>
                        <span className="text-sm text-gray-300 font-light">{benefit}</span>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Right Side - Form */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  {isSubmitted ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-green-500/10 backdrop-blur-md border border-green-500/30 rounded-2xl p-8 text-center"
                    >
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/40 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Welcome to the Journey!
                      </h3>
                      <p className="text-sm text-gray-300 font-light">
                        Thank you for subscribing. Check your email for a confirmation message.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="email" className="sr-only">
                            Email address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email"
                              className="w-full pl-12 pr-4 py-6 bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                              disabled={isSubmitting}
                            />
                          </div>
                          {error && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-400"
                            >
                              {error}
                            </motion.p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting || !email}
                          className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Subscribing...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              Subscribe Now
                              <Send className="ml-2 h-4 w-4" />
                            </span>
                          )}
                        </Button>

                        <p className="text-xs text-gray-400 text-center font-light">
                          We respect your privacy. Unsubscribe anytime.
                        </p>
                      </form>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Decorative Border Glow */}
          <div className="absolute -inset-px rounded-[2.5rem] bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>No spam, ever</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>Free forever</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-600" />
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>50K+ subscribers</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
