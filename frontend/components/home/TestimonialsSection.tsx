'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TESTIMONIALS = [
    {
        id: 1,
        name: "Aarav Sharma",
        role: "Yoga Instructor",
        content: "DivyaVaani has transformed how I prepare for my classes. The depth of spiritual insight it provides is truly remarkable and feels incredibly authentic.",
        rating: 5
    },
    {
        id: 2,
        name: "Sarah Jenkins",
        role: "Mindfulness Coach",
        content: "I was skeptical about AI for spirituality, but this app captures the essence of the Gita beautifully. It's like having a wise mentor in my pocket.",
        rating: 5
    },
    {
        id: 3,
        name: "Priya Patel",
        role: "Software Engineer",
        content: "In the middle of a stressful workday, DivyaVaani helps me find center. The guidance is practical yet deeply rooted in ancient wisdom.",
        rating: 5
    }
];

export function TestimonialsSection() {
    return (
        <section className="relative py-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-7xl px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20 space-y-4"
                >
                    <div className="inline-flex items-center justify-center space-x-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-2 backdrop-blur-sm">
                        <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                        <span className="text-sm font-medium text-orange-200 uppercase tracking-widest">Trusted by 10,000+ Seekers</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        Voices of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">Community</span>
                    </h2>

                    <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed">
                        See how DivyaVaani is touching lives and bringing ancient wisdom to the modern world.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((testimonial, idx) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2, duration: 0.6 }}
                            className="relative group h-full"
                        >
                            <div className="h-full bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300 hover:-translate-y-2">
                                <Quote className="absolute top-8 right-8 w-10 h-10 text-white/5 rotate-180" />

                                <div className="flex items-center space-x-4 mb-6">
                                    <Avatar className="h-14 w-14 border-2 border-white/10 shadow-inner">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.id}`} />
                                        <AvatarFallback className="bg-orange-900 text-orange-200">{testimonial.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-white text-lg">{testimonial.name}</div>
                                        <div className="text-sm text-orange-400/80 font-medium">{testimonial.role}</div>
                                    </div>
                                </div>

                                <div className="flex mb-4 space-x-1">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
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
