'use client';

import { motion } from 'framer-motion';
import { Globe2, Check, Sparkles } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸', speakers: '1.5B+' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', speakers: '600M+' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', flag: '🕉️', speakers: 'Sacred' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩', speakers: '265M+' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', speakers: '95M+' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', speakers: '80M+' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', speakers: '83M+' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', speakers: '56M+' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', speakers: '44M+' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', speakers: '38M+' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', speakers: '125M+' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳', speakers: '35M+' },
];

const FEATURES_LIST = [
  'Real-time translation',
  'Voice input & output',
  'Cultural context awareness',
  'Script transliteration',
  'Regional dialect support',
  'Multilingual responses',
];

export function LanguagesSection() {
  return (
    <section className="relative py-16 md:py-32 overflow-hidden">
      {/* Subtle edge glows – transparent so scroll background shows */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full blur-[120px] -z-10 pointer-events-none opacity-25" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full blur-[120px] -z-10 pointer-events-none opacity-25" style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.18) 0%, transparent 70%)' }} />

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 space-y-4"
        >
          <div className="inline-flex items-center justify-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-2 backdrop-blur-sm">
            <Globe2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-200 uppercase tracking-widest">
              Break Language Barriers
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Speak in Your{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400">
              Native Tongue
            </span>
          </h2>

          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
            Experience spiritual wisdom in 12+ languages. Ask questions in your language,
            receive guidance that resonates with your cultural heritage.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Languages Grid */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50" />

            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {LANGUAGES.map((lang, idx) => (
                  <motion.div
                    key={lang.code}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group relative bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-blue-500/40 transition-all duration-300 hover:bg-white/10 cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{lang.flag}</div>
                      <div className="text-sm font-bold text-white mb-1">
                        {lang.native}
                      </div>
                      <div className="text-xs text-gray-400 font-medium">
                        {lang.name}
                      </div>
                      <div className="text-xs text-blue-400/70 mt-1 font-light">
                        {lang.speakers}
                      </div>
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>
                ))}
              </div>

              {/* Total Languages Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center space-x-2 bg-linear-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-5 py-2">
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <span className="text-sm font-bold text-blue-100">
                    12+ Languages Supported
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {FEATURES_LIST.map((feature, idx) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="flex items-start space-x-4 group"
                >
                  <div className="shrink-0 h-8 w-8 rounded-full bg-linear-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Check className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors">
                      {feature}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 font-light">
                      {feature === 'Real-time translation' && 'Instant conversion between all supported languages'}
                      {feature === 'Voice input & output' && 'Speak and listen in your preferred language'}
                      {feature === 'Cultural context awareness' && 'Responses tailored to your cultural background'}
                      {feature === 'Script transliteration' && 'Convert between different writing systems seamlessly'}
                      {feature === 'Regional dialect support' && 'Understanding local variations and nuances'}
                      {feature === 'Multilingual responses' && 'Get answers with references in multiple languages'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="pt-6"
            >
              <div className="bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Globe2 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Your Language, Your Wisdom
                  </h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-light">
                  DivyaVaani understands the deep connection between language and spirituality.
                  Experience sacred teachings in the language that speaks to your heart.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Sample Translation Demo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-purple-500/20 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
                One Question, Infinite Expressions
              </h3>

              <div className="flex sm:grid overflow-x-auto sm:overflow-visible gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8 pt-4 px-1 -mx-4 sm:mx-0 sm:px-0 sm:pt-0 sm:pb-0 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden after:content-[''] after:w-px after:shrink-0 sm:after:hidden">
                {[
                  { lang: 'English', text: 'What is the path to inner peace?', color: 'from-blue-400 to-blue-600' },
                  { lang: 'Hindi', text: 'आंतरिक शांति का मार्ग क्या है?', color: 'from-orange-400 to-orange-600' },
                  { lang: 'Sanskrit', text: 'आन्तरिक शान्तिः मार्गः कः?', color: 'from-amber-400 to-amber-600' },
                  { lang: 'Tamil', text: 'உள் அமைதிக்கான பாதை என்ன?', color: 'from-green-400 to-green-600' },
                  { lang: 'Telugu', text: 'అంతర్గత శాంతికి మార్గం ఏమిటి?', color: 'from-purple-400 to-purple-600' },
                  { lang: 'Bengali', text: 'অভ্যন্তরীণ শান্তির পথ কী?', color: 'from-pink-400 to-pink-600' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.lang}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all duration-300 shrink-0 w-[80vw] sm:w-auto snap-center"
                  >
                    <div className={`inline-block text-xs font-bold bg-linear-to-r ${item.color} text-transparent bg-clip-text mb-2 uppercase tracking-wider`}>
                      {item.lang}
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed font-light">
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
