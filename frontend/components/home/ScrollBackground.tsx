'use client';

import { useScroll, useTransform, motion } from 'framer-motion';

export function ScrollBackground() {
    const { scrollYProgress } = useScroll();

    // Interpolate background colors based on scroll position
    // 0 - Start (Hero): Deep Space Blue / Almost Black
    // 0.2 - Features: Dark Purple / Indigo
    // 0.5 - How It Works: Sunrise Orange / Warm
    // 0.8 - Testimonials: Light Warm White
    // 1.0 - Footer: Soft White
    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 0.2, 0.5, 0.8, 1],
        [
            '#0a0a0a', // Deep dark
            '#1a103c', // Deep Purple
            '#fff7ed', // Orange 50 (Warm white)
            '#ffffff', // White
            '#ffffff'
        ]
    );

    return (
        <motion.div
            style={{ backgroundColor }}
            className="fixed inset-0 -z-50 transition-colors duration-700"
        />
    );
}
