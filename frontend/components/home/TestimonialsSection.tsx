"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TESTIMONIALS } from "@/lib/utils/constants";

export function TestimonialsSection() {
  return (
    <section className="relative py-16 md:py-32 overflow-hidden">
      {/* Ambient glow – transparent so scroll background shows */}
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-30" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 space-y-4"
        >
          <div className="inline-flex items-center justify-center space-x-2 bg-indigo-600/15 border border-indigo-400/30 rounded-full px-4 py-1.5 mb-2 backdrop-blur-sm">
            <Star className="w-4 h-4 text-indigo-400 fill-indigo-400" />
            <span className="text-sm font-medium text-indigo-200 uppercase tracking-widest">
              Trusted by 10,000+ Seekers
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Voices of the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-200">
              Community
            </span>
          </h2>

          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
            See how DivyaVaani is touching lives and bringing ancient wisdom to
            the modern world.
          </p>
        </motion.div>

        <div className="flex overflow-x-auto gap-6 pb-12 pt-4 px-4 -mx-4 sm:mx-0 sm:px-0 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden after:content-[''] after:w-px after:shrink-0">
          {TESTIMONIALS.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="relative group shrink-0 w-[85vw] sm:w-[400px] snap-center stretch"
            >
              <div className="h-full bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300 hover:-translate-y-2 flex flex-col">
                <Quote className="absolute top-8 right-8 w-10 h-10 text-white/5 rotate-180" />

                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-14 w-14 border-2 border-white/10 shadow-inner">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-orange-900 text-orange-200">
                      {testimonial.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-white text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-orange-400/80 font-medium">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                <div className="flex mb-4 space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                <p className="text-gray-300 leading-relaxed italic font-light relative z-10">
                  &quot;{testimonial.content}&quot;
                </p>

                {/* Glow */}
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
